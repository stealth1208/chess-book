'use client';

import { useCallback } from 'react';
import { Group, Text, Tree, useTree } from '@mantine/core';
import { useTopicTreeData } from '@/shared/hooks/useTopicTreeData';
import { useTopicStore } from '@/shared/store/useTopicStore';

const TOPIC_PREFIX = 'topic:';
const FOLDER_PREFIX = 'folder:';

export const TopicStructure = () => {
  const {
    topics,
    folders,
    selectedTopicId,
    selectedFolderId,
    selectFolder,
    selectTopic,
  } = useTopicStore();

  const { treeWithoutVariations } = useTopicTreeData({ topics, folders });

  const tree = useTree();

  const handleNodeClick = useCallback((value: string): void => {
    if (value.startsWith(TOPIC_PREFIX)) {
      const topicId = value.slice(TOPIC_PREFIX.length);
      selectTopic(topicId);
      selectFolder(null);
      return;
    }

    if (value.startsWith(FOLDER_PREFIX)) {
      const folderId = value.slice(FOLDER_PREFIX.length);
      selectFolder(folderId);
    }
  }, [selectFolder, selectTopic]);

  if (treeWithoutVariations.length === 0) {
    return (
      <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc nao.</p>
    );
  }

  return (
    <nav className="custom-scrollbar h-full overflow-y-auto p-4">
      <Tree
        data={treeWithoutVariations}
        tree={tree}
        levelOffset="md"
        renderNode={({ node, elementProps, hasChildren }) => {
          const value = String(node.value);
          const isTopic = value.startsWith(TOPIC_PREFIX);
          const isFolder = value.startsWith(FOLDER_PREFIX);
          const topicId = isTopic ? value.slice(TOPIC_PREFIX.length) : null;
          const folderId = isFolder ? value.slice(FOLDER_PREFIX.length) : null;

          const isSelectedTopic = Boolean(topicId) && selectedTopicId === topicId;
          const isSelectedFolder = isFolder && selectedFolderId === folderId;

          return (
            <div
              {...elementProps}
              onClick={(event) => {
                elementProps.onClick(event);
                handleNodeClick(value);
              }}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                isSelectedTopic
                  ? 'bg-secondary/20 text-secondary'
                  : isSelectedFolder
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface hover:bg-surface-container-high'
              } ${elementProps.className}`}
            >
              <span className="material-symbols-outlined text-base">
                {isTopic ? 'auto_stories' : hasChildren ? 'folder_open' : 'folder'}
              </span>

              <Group gap={8} wrap="nowrap" className="min-w-0 flex-1">
                <Text size="sm" truncate>
                  {node.label}
                </Text>
              </Group>
            </div>
          );
        }}
      />
    </nav>
  );
};
