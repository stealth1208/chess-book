import { useCallback, useMemo } from 'react';
import type { TreeNodeData } from '@mantine/core';
import type { Folder, Topic } from '@/shared/chessBook/types/chessBook';

const TOPIC_PREFIX = 'topic:';
const FOLDER_PREFIX = 'folder:';

const getTopicRootKey = (topicId: string): string => `${TOPIC_PREFIX}${topicId}`;

type BuildFolderNodes = (parentKey: string, depth?: number, visited?: Set<string>) => TreeNodeData[];

interface UseTopicTreeDataOptions {
  topics: Topic[];
  folders: Folder[];
  maxDepth?: number;
}

export const useTopicTreeData = ({
  topics,
  folders,
  maxDepth = 20,
}: UseTopicTreeDataOptions): TreeNodeData[] => {
  const foldersByParent = useMemo(() => {
    const map = new Map<string, Folder[]>();

    for (const folder of folders) {
      const key = folder.parentId ?? getTopicRootKey(folder.topicId);
      const existingFolders = map.get(key);

      if (existingFolders) {
        existingFolders.push(folder);
        continue;
      }

      map.set(key, [folder]);
    }

    return map;
  }, [folders]);

  const buildFolderNodes: BuildFolderNodes = useCallback(
    (parentKey: string, depth = 0, visited: Set<string> = new Set()): TreeNodeData[] => {
      const list = foldersByParent.get(parentKey) ?? [];

      return list.flatMap((folder): TreeNodeData[] => {
        if (visited.has(folder.id) || depth > maxDepth) {
          return [];
        }

        const nextVisited = new Set(visited);
        nextVisited.add(folder.id);
        const nestedFolders = buildFolderNodes(folder.id, depth + 1, nextVisited);

        return [{
          value: `${FOLDER_PREFIX}${folder.id}`,
          label: folder.name,
          children: nestedFolders,
        }];
      });
    },
    [foldersByParent, maxDepth]
  );

  return useMemo(() => {
    return topics.map((topic) => ({
      value: getTopicRootKey(topic.id),
      label: topic.name,
      children: buildFolderNodes(getTopicRootKey(topic.id)),
    }));
  }, [buildFolderNodes, topics]);
};