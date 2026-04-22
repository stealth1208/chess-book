'use client';

import { useCallback, useRef, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Text, Tree, useTree } from '@mantine/core';
import { useFolderTreeActions } from '@/features/library/hooks/useFolderTreeActions';
import { TopicNodeEditModal } from '@/features/TopicView/TopicNodeEditModal';
import { useTopicTreeData } from '@/shared/hooks/useTopicTreeData';
import { useGameStore } from '@/shared/store/useGameStore';
import { useTopicStore } from '@/shared/store/useTopicStore';

interface TopicViewProps {
  onEditVariation?: (variationId: string) => void;
  onSelectTopic?: (topicId: string | null) => void;
  onSelectFolder?: (folderId: string | null) => void;
  showHeader?: boolean;
  showNodeActions?: boolean;
}

const TOPIC_PREFIX = 'topic:';
const FOLDER_PREFIX = 'folder:';
const VARIATION_PREFIX = 'variation:';
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
}: TopicViewProps) => {
  const {
    topics,
    folders,
    variations,
    createTopic,
    createFolder,
    renameTopic,
    deleteTopic,
    renameFolder,
    deleteFolder,
    selectFolder,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    selectVariationById,
    promptFolderName,
  } = useFolderTreeActions();


  const { loadVariation } = useGameStore();
  const topicStore = useTopicStore();
  const {    
    treeWithVariations,
    
  } = useTopicTreeData({
    topics,
    folders,
    variations,
  });

  const tree = useTree();
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [editNodeState, setEditNodeState] = useState<EditNodeState>({
    isOpen: false,
    nodeType: null,
    nodeId: null,
    nodeName: '',
  });

  const [currentVariation, setCurrentVariation] = useState<{ 
    id: string | null; 
    topicId: string | null; 
    folderId: string | null 
  } | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  const [currentFolderId, setCurrentFolderId] = useState<string>('');

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
      setCurrentTopicId(topicId);
      onSelectTopic?.(topicId);
      onSelectFolder?.(null);
      return;
    }

    if (value.startsWith(FOLDER_PREFIX)) {
      const folderId = value.slice(FOLDER_PREFIX.length);
      setCurrentFolderId(folderId);
      onSelectFolder?.(folderId);
      onSelectTopic?.(null);
      return;
    }

    if (value.startsWith(VARIATION_PREFIX)) {
      const variationId = value.slice(VARIATION_PREFIX.length);
      const variation = topicStore.variations.find((v) => v.id === variationId);
     
      selectVariationById(variationId);
      setCurrentVariation(variation || null);
      
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
        {treeWithVariations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc hoac bien nao.</p>
        ) : (
          <Tree
            data={treeWithVariations}
            tree={tree}
            levelOffset="md"
            renderNode={({ node, elementProps, hasChildren }) => {
              const value = String(node.value);
              const isTopic = value.startsWith(TOPIC_PREFIX);
              const isFolder = value.startsWith(FOLDER_PREFIX);
              const isVariation = value.startsWith(VARIATION_PREFIX);

              const topicId = isTopic ? value.slice(TOPIC_PREFIX.length) : null;
              const folderId = isFolder ? value.slice(FOLDER_PREFIX.length) : null;
              const variationId = isVariation ? value.slice(VARIATION_PREFIX.length) : null;
              
              const variation = currentVariation;
              const isSelectedTopic = isTopic && currentTopicId === topicId;
              const isSelectedFolder = isFolder && currentFolderId === folderId;
              const isSelectedVariation = isVariation && currentVariation?.id === variationId;
            

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
                          if (topicId) {
                            createChildFolder(topicId, folderId);
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