'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Text, Tree, type TreeNodeData, useTree } from '@mantine/core';
import { useFolderTreeActions } from '@/features/library/hooks/useFolderTreeActions';
import { TopicNodeEditModal } from '@/features/TopicView/TopicNodeEditModal';
import { useGameStore } from '@/shared/store/useGameStore';
import { useTopicStore } from '@/shared/store/useTopicStore';

interface TopicViewProps {
  onEditVariation?: (variationId: string) => void;
  onSelectTopic?: (topicId: string | null) => void;
  onSelectFolder?: (folderId: string | null) => void;
  showHeader?: boolean;
  showNodeActions?: boolean;
  showVariations?: boolean;
}

const TOPIC_PREFIX = 'topic:';
const FOLDER_PREFIX = 'folder:';
const VARIATION_PREFIX = 'variation:';

const getTreeContainerKey = (topicId: string, parentId: string | null): string => parentId ?? `${TOPIC_PREFIX}${topicId}`;

const getExpandedFolderIdsFromState = (state: Record<string, boolean>): string[] => {
  return Object.entries(state)
    .filter(([value, expanded]) => expanded && value.startsWith(FOLDER_PREFIX))
    .map(([value]) => value.slice(FOLDER_PREFIX.length));
};

const getNormalizedIdsKey = (ids: string[]): string => JSON.stringify([...ids].sort());

type EditNodeType = 'topic' | 'folder';

type EditNodeState = {
  isOpen: boolean;
  nodeType: EditNodeType | null;
  nodeId: string | null;
  nodeName: string;
};

export const TopicView = ({
  onEditVariation,
  onSelectTopic,
  onSelectFolder,
  showHeader = true,
  showNodeActions = true,
  showVariations = true,
}: TopicViewProps) => {
  const {
    topics,
    folders,
    variations,
    selectedTopicId,
    selectedFolderId,
    selectedVariationId,
    createTopic,
    createFolder,
    renameTopic,
    deleteTopic,
    renameFolder,
    deleteFolder,
    selectTopic,
    selectFolder,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    selectVariationById,
    promptFolderName,
  } = useFolderTreeActions();

  const { loadVariation } = useGameStore();
  const topicStore = useTopicStore();

  const tree = useTree();
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const syncedExpandedKeyRef = useRef<string>('');
  const [editNodeState, setEditNodeState] = useState<EditNodeState>({
    isOpen: false,
    nodeType: null,
    nodeId: null,
    nodeName: '',
  });

  const openEditModal = useCallback((nodeType: EditNodeType, nodeId: string, nodeName: string) => {
    setEditNodeState({
      isOpen: true,
      nodeType,
      nodeId,
      nodeName,
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditNodeState({
      isOpen: false,
      nodeType: null,
      nodeId: null,
      nodeName: '',
    });
  }, []);

  const foldersByParent = useMemo(() => {
    const map = new Map<string, typeof folders>();

    for (const folder of folders) {
      const key = getTreeContainerKey(folder.topicId, folder.parentId);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(folder);
    }

    return map;
  }, [folders]);

  const variationsByContainer = useMemo(() => {
    if (!showVariations) {
      return new Map<string, typeof variations>();
    }

    const map = new Map<string, typeof variations>();

    for (const variation of variations) {
      const key = variation.folderId ?? `${TOPIC_PREFIX}${variation.topicId}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(variation);
    }

    return map;
  }, [showVariations, variations]);

  const buildFolderNodes = useCallback((parentKey: string, depth = 0, visited: Set<string> = new Set()): TreeNodeData[] => {
    const list = foldersByParent.get(parentKey) ?? [];

    return list.flatMap((folder) => {
      if (visited.has(folder.id) || depth > 20) {
        return [];
      }

      const folderVariations = variationsByContainer.get(folder.id) ?? [];
      const nextVisited = new Set(visited);
      nextVisited.add(folder.id);
      const nestedFolders = buildFolderNodes(folder.id, depth + 1, nextVisited);

      return [
        {
          value: `folder:${folder.id}`,
          label: folder.name,
          children: [
            ...nestedFolders,
            ...folderVariations.map((variation) => ({
              value: `variation:${variation.id}`,
              label: variation.name,
            })),
          ],
        },
      ];
    });
  }, [foldersByParent, variationsByContainer]);

  const treeData = useMemo<TreeNodeData[]>(() => {
    return topics.map((topic) => ({
      value: `${TOPIC_PREFIX}${topic.id}`,
      label: topic.name,
      children: [
        ...buildFolderNodes(`${TOPIC_PREFIX}${topic.id}`),
        ...(variationsByContainer.get(`${TOPIC_PREFIX}${topic.id}`) ?? []).map((variation) => ({
          value: `${VARIATION_PREFIX}${variation.id}`,
          label: variation.name,
        })),
      ],
    }));
  }, [buildFolderNodes, topics, variationsByContainer]);

  const syncExpandedIdsFromTree = useCallback((): void => {
    const nextExpandedIds = getExpandedFolderIdsFromState(tree.expandedState as Record<string, boolean>);
    const nextKey = getNormalizedIdsKey(nextExpandedIds);

    if (syncedExpandedKeyRef.current !== nextKey) {
      syncedExpandedKeyRef.current = nextKey;
      setExpandedFolderIds(nextExpandedIds);
    }
  }, [setExpandedFolderIds, tree.expandedState]);

  const createChildFolder = useCallback((topicId: string, parentFolderId: string | null) => {
    const nextName = promptFolderName('Thu muc moi');
    if (!nextName) {
      return;
    }

    const newFolderId = createFolder(nextName, parentFolderId, topicId);
    if (!newFolderId) {
      return;
    }

    if (parentFolderId) {
      const nextExpandedFolderIds = Array.from(new Set([...expandedFolderIds, parentFolderId]));
      setExpandedFolderIds(nextExpandedFolderIds);
    }

    selectFolder(newFolderId);
    expandFolderPath(newFolderId);
  }, [createFolder, expandFolderPath, expandedFolderIds, promptFolderName, selectFolder, setExpandedFolderIds]);

  const handleNodeClick = (value: string): void => {
    if (value.startsWith(TOPIC_PREFIX)) {
      const topicId = value.slice(TOPIC_PREFIX.length);
      selectTopic(topicId);
      onSelectTopic?.(topicId);
      onSelectFolder?.(null);
      return;
    }

    if (value.startsWith(FOLDER_PREFIX)) {
      const folderId = value.slice(FOLDER_PREFIX.length);
      selectFolder(folderId);
      onSelectFolder?.(folderId);
      return;
    }

    if (value.startsWith(VARIATION_PREFIX)) {
      const variationId = value.slice(VARIATION_PREFIX.length);
      const variation = topicStore.variations.find((v) => v.id === variationId);
      
      selectVariationById(variationId);
      
      if (variation) {
        loadVariation(variation.initialFen, variation.moves);
      }
    }
  };

  const handleCreateTopic = (): void => {
    const name = promptFolderName('Topic moi');
    if (name) {
      createTopic(name);
    }
  };

  const editTopic = editNodeState.nodeType === 'topic' && editNodeState.nodeId
    ? topics.find((topic) => topic.id === editNodeState.nodeId) ?? null
    : null;
  const editFolder = editNodeState.nodeType === 'folder' && editNodeState.nodeId
    ? folders.find((folder) => folder.id === editNodeState.nodeId) ?? null
    : null;

  const topicHasChildren = editTopic
    ? folders.some((folder) => folder.topicId === editTopic.id) || variations.some((variation) => variation.topicId === editTopic.id)
    : false;
  const folderHasChildren = editFolder
    ? folders.some((folder) => folder.parentId === editFolder.id) || variations.some((variation) => variation.folderId === editFolder.id)
    : false;

  const deleteDisabled = editNodeState.nodeType === 'topic' ? topicHasChildren : folderHasChildren;
  const deleteDisabledReason = editNodeState.nodeType === 'topic'
    ? 'Cannot delete topic because it is not empty.'
    : 'Cannot delete folder because it is not empty.';

  const handleSaveNodeName = (name: string): void => {
    const nextName = name.trim();
    if (!nextName || !editNodeState.nodeId || !editNodeState.nodeType) {
      return;
    }

    if (editNodeState.nodeType === 'topic') {
      renameTopic(editNodeState.nodeId, nextName);
      return;
    }

    renameFolder(editNodeState.nodeId, nextName);
  };

  const handleDeleteNode = (): void => {
    if (!editNodeState.nodeId || !editNodeState.nodeType || deleteDisabled) {
      return;
    }

    if (editNodeState.nodeType === 'topic') {
      deleteTopic(editNodeState.nodeId);
      return;
    }

    deleteFolder(editNodeState.nodeId);
  };

  return (
    <section className="flex h-full flex-col overflow-hidden bg-surface-container-low">
      {showHeader && (
        <div className="shrink-0 border-b border-outline-variant/10 p-5">
          <h2 className="font-headline text-xl font-bold text-on-surface">Lộ trình khai cuộc</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Thư mục và biến được đồng bộ từ bộ nhớ cục bộ.</p>
          <div className="mt-3 flex gap-2">
            <Button size="xs" onClick={handleCreateTopic}>
              + Topic
            </Button>
          </div>
        </div>
      )}

      <nav className="custom-scrollbar flex-1 overflow-y-auto p-4">
        {treeData.length === 0 ? (
          <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc hoac bien nao.</p>
        ) : (
          <Tree
            data={treeData}
            tree={tree}
            levelOffset="md"
            renderNode={({ node, elementProps, hasChildren }) => {
              const value = String(node.value);
              const isTopic = value.startsWith(TOPIC_PREFIX);
              const isFolder = value.startsWith(FOLDER_PREFIX);
              const topicId = isTopic ? value.slice(TOPIC_PREFIX.length) : null;
              const folderId = isFolder ? value.slice(FOLDER_PREFIX.length) : null;
              const variationId = value.startsWith(VARIATION_PREFIX) ? value.slice(VARIATION_PREFIX.length) : null;
              const currentFolder = folderId ? folders.find((folder) => folder.id === folderId) ?? null : null;
              const variation = variationId ? variations.find((item) => item.id === variationId) ?? null : null;
              const isSelectedTopic = Boolean(topicId) && selectedTopicId === topicId;
              const isSelectedFolder = isFolder && selectedFolderId === folderId;
              const isSelectedVariation = Boolean(variationId) && selectedVariationId === variationId;
              const nodeTopicId =
                topicId ??
                currentFolder?.topicId ??
                variation?.topicId ??
                selectedTopicId ??
                topics[0]?.id ??
                null;

              return (
                <div
                  {...elementProps}
                  ref={(element) => {
                    if (element) {
                      nodeRefs.current.set(value, element);
                    } else {
                      nodeRefs.current.delete(value);
                    }
                  }}
                  onClick={(event) => {
                    elementProps.onClick(event);
                    handleNodeClick(value);

                    // Mantine updates tree.expandedState in the click handler.
                    // Queue sync to capture latest expand/collapse state.
                    queueMicrotask(syncExpandedIdsFromTree);
                  }}
                  onContextMenu={(event) => {
                    if ((!isTopic || !topicId) && (!isFolder || !folderId)) {
                      return;
                    }

                    event.preventDefault();

                    if (isTopic && topicId) {
                      openEditModal('topic', topicId, String(node.label));
                      return;
                    }

                    if (isFolder && folderId) {
                      openEditModal('folder', folderId, String(node.label));
                    }
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    isSelectedTopic
                      ? 'bg-secondary/20 text-secondary'
                      : isSelectedFolder
                      ? 'bg-primary/10 text-primary'
                      : isSelectedVariation
                        ? 'bg-tertiary/15 text-tertiary'
                        : 'text-on-surface hover:bg-surface-container-high'
                  } ${elementProps.className}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isTopic ? 'auto_stories' : isFolder ? (hasChildren ? 'folder_open' : 'folder') : 'chess'}
                  </span>

                  <Group gap={8} wrap="nowrap" className="min-w-0 flex-1">
                    <Text size="sm" truncate>
                      {node.label}
                    </Text>
                    {variationId && (
                      <Badge size="xs" variant="light" color="jade">
                        Variation
                      </Badge>
                    )}
                  </Group>

                  {showNodeActions && isTopic && topicId && (
                    <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          createChildFolder(topicId, null);
                        }}
                        title="Them folder con"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          openEditModal('topic', topicId, String(node.label));
                        }}
                        title="Doi ten topic"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                    </Group>
                  )}

                  {showNodeActions && isFolder && folderId && (
                    <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          if (nodeTopicId) {
                            createChildFolder(nodeTopicId, folderId);
                          }
                        }}
                        title="Them folder con"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          openEditModal('folder', folderId, String(node.label));
                        }}
                        title="Doi ten folder"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                    </Group>
                  )}

                  {showNodeActions && !isFolder && variationId && onEditVariation && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        const variationFolderId = variation?.folderId ?? null;
                        if (variationFolderId) {
                          expandFolderPath(variationFolderId);
                        }
                        onEditVariation(variationId);
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </ActionIcon>
                  )}

                </div>
              );
            }}
          />
        )}
      </nav>

      <TopicNodeEditModal
        key={`${editNodeState.nodeType ?? 'none'}:${editNodeState.nodeId ?? 'none'}:${editNodeState.isOpen ? 'open' : 'closed'}`}
        isOpen={editNodeState.isOpen}
        mode={editNodeState.nodeType === 'topic' ? 'topic' : 'folder'}
        initialName={editNodeState.nodeName}
        onClose={closeEditModal}
        onSave={handleSaveNodeName}
        onDelete={handleDeleteNode}
        deleteDisabled={deleteDisabled}
        deleteDisabledReason={deleteDisabledReason}
      />
    </section>
  );
};