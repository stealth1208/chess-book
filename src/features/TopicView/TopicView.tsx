'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActionIcon, Badge, Group, Text, Tree, getTreeExpandedState, type TreeNodeData, useTree } from '@mantine/core';
import { useFolderTreeActions } from '@/features/library/hooks/useFolderTreeActions';

interface TopicViewProps {
  onEditVariation?: (variationId: string) => void;
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

export const TopicView = ({ onEditVariation }: TopicViewProps) => {
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
    renameFolder,
    tryDeleteFolder,
    selectTopic,
    selectFolder,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    loadVariationById,
    promptFolderName,
  } = useFolderTreeActions();

  const tree = useTree();
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const appliedExpandedKeyRef = useRef<string>('');
  const syncedExpandedKeyRef = useRef<string>('');

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
    const map = new Map<string, typeof variations>();

    for (const variation of variations) {
      const key = variation.folderId ?? `${TOPIC_PREFIX}${variation.topicId}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(variation);
    }

    return map;
  }, [variations]);

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
      selectTopic(value.slice(TOPIC_PREFIX.length));
      return;
    }

    if (value.startsWith(FOLDER_PREFIX)) {
      const folderId = value.slice(FOLDER_PREFIX.length);
      selectFolder(folderId);
      return;
    }

    if (value.startsWith(VARIATION_PREFIX)) {
      loadVariationById(value.slice(VARIATION_PREFIX.length));
    }
  };

  const handleCreateTopic = (): void => {
    const name = promptFolderName('Topic moi');
    if (name) {
      createTopic(name);
    }
  };

  // useEffect(() => {
  //   const state = getTreeExpandedState(treeData, '*') as Record<string, boolean>;

  //   for (const value of Object.keys(state)) {
  //     if (value.startsWith(TOPIC_PREFIX)) {
  //       state[value] = true;
  //     }
  //     if (value.startsWith(FOLDER_PREFIX)) {
  //       const folderId = value.slice(FOLDER_PREFIX.length);
  //       state[value] = expandedFolderIds.includes(folderId);
  //     }
  //   }

  //   const desiredExpandedIds = getExpandedFolderIdsFromState(state);
  //   const desiredExpandedKey = getNormalizedIdsKey(desiredExpandedIds);
  //   if (appliedExpandedKeyRef.current === desiredExpandedKey) {
  //     return;
  //   }

  //   appliedExpandedKeyRef.current = desiredExpandedKey;
  //   syncedExpandedKeyRef.current = desiredExpandedKey;
  //   tree.setExpandedState(state);
  // }, [expandedFolderIds, tree, treeData]);



  return (
    <section className="flex h-full flex-col overflow-hidden bg-surface-container-low">
      <div className="shrink-0 border-b border-outline-variant/10 p-5">
        <h2 className="font-headline text-xl font-bold text-on-surface">Lộ trình khai cuộc</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Thư mục và biến được đồng bộ từ bộ nhớ cục bộ.</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary" onClick={handleCreateTopic}>
            + Topic
          </button>
        </div>
      </div>

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
                    if (!isFolder || !folderId) {
                      return;
                    }

                    event.preventDefault();
                    const command = window.prompt('1: Doi ten folder\n2: Xoa folder\nNhap lua chon:');
                    if (command === '1') {
                      const nextName = promptFolderName(String(node.label));
                      if (nextName) {
                        renameFolder(folderId, nextName);
                      }
                    }
                    if (command === '2') {
                      tryDeleteFolder(folderId);
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
                      <Badge size="xs" variant="light" color="teal">
                        Variation
                      </Badge>
                    )}
                  </Group>

                  {isTopic && topicId && (
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
                          const nextName = promptFolderName(String(node.label));
                          if (nextName) {
                            renameTopic(topicId, nextName);
                          }
                        }}
                        title="Doi ten topic"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                    </Group>
                  )}

                  {isFolder && folderId && (
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
                          const nextName = promptFolderName(String(node.label));
                          if (nextName && folderId) {
                            renameFolder(folderId, nextName);
                          }
                        }}
                        title="Doi ten folder"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                    </Group>
                  )}

                  {!isFolder && variationId && onEditVariation && (
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
    </section>
  );
};