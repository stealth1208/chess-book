import { useCallback, useMemo } from 'react';
import type { TreeNodeData } from '@mantine/core';
import type { Folder, Topic, Variation } from '@/shared/chessBook/types/chessBook';

const TOPIC_PREFIX = 'topic:';
const FOLDER_PREFIX = 'folder:';
const VARIATION_PREFIX = 'variation:';
const EMPTY_VARIATIONS: Variation[] = [];

const getTopicRootKey = (topicId: string): string => `${TOPIC_PREFIX}${topicId}`;
const getFolderNodeKey = (folderId: string): string => `${FOLDER_PREFIX}${folderId}`;
const getVariationContainerKey = (variation: Variation): string => {
  if (variation.folderId) {
    return getFolderNodeKey(variation.folderId);
  }

  return getTopicRootKey(variation.topicId);
};

const createVariationNode = (variationId: string, label: string): TreeNodeData => ({
  value: `${VARIATION_PREFIX}${variationId}`,
  label,
});

type BuildFolderNodes = (parentKey: string, depth?: number, visited?: Set<string>) => TreeNodeData[];

interface UseTopicTreeDataOptions {
  topics: Topic[];
  folders: Folder[];
  variations?: Variation[];
  maxDepth?: number;
}

interface UseTopicTreeDataResult {
  treeWithoutVariations: TreeNodeData[];
  treeWithVariations: TreeNodeData[];
}

export const useTopicTreeData = ({
  topics,
  folders,
  variations = EMPTY_VARIATIONS,
  maxDepth = 20,
}: UseTopicTreeDataOptions): UseTopicTreeDataResult => {
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

  const treeWithoutVariations = useMemo<TreeNodeData[]>(() => {
    return topics.map((topic) => ({
      value: getTopicRootKey(topic.id),
      label: topic.name,
      children: buildFolderNodes(getTopicRootKey(topic.id)),
    }));
  }, [buildFolderNodes, topics]);

  const variationsByContainer = useMemo(() => {
    const map = new Map<string, Variation[]>();

    for (const variation of variations) {
      const key = getVariationContainerKey(variation);
      const existingVariations = map.get(key);

      if (existingVariations) {
        existingVariations.push(variation);
        continue;
      }

      map.set(key, [variation]);
    }

    return map;
  }, [variations]);

  const treeWithVariations = useMemo<TreeNodeData[]>(() => {
    const attachVariationNodes = (nodes: TreeNodeData[]): TreeNodeData[] => {
      return nodes.map((node) => {
        const value = String(node.value);
        const nestedChildren = attachVariationNodes(node.children ?? []);

        if (!value.startsWith(TOPIC_PREFIX) && !value.startsWith(FOLDER_PREFIX)) {
          return {
            ...node,
            children: nestedChildren,
          };
        }

        const variationChildren = (variationsByContainer.get(value) ?? []).map((variation) => {
          return createVariationNode(variation.id, variation.name);
        });

        return {
          ...node,
          children: [...nestedChildren, ...variationChildren],
        };
      });
    };

    return attachVariationNodes(treeWithoutVariations);
  }, [treeWithoutVariations, variationsByContainer]);

  return {
    treeWithoutVariations,
    treeWithVariations,
  };
};