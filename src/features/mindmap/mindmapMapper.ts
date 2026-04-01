import type { Folder, Variation } from '@/features/types/study';

export type MindmapNode = {
  id: string;
  label: string;
  type: 'folder' | 'variation';
  parentId: string | null;
  moveCount?: number;
};

export type MindmapEdge = {
  id: string;
  from: string;
  to: string;
};

export type MindmapGraph = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
};

export function mapStudyToMindmap(folders: Folder[], variations: Variation[]): MindmapGraph {
  const folderNodes: MindmapNode[] = folders.map((folder) => ({
    id: `folder:${folder.id}`,
    label: folder.name,
    type: 'folder',
    parentId: folder.parentId ? `folder:${folder.parentId}` : null,
  }));

  const variationNodes: MindmapNode[] = variations.map((variation) => ({
    id: `variation:${variation.id}`,
    label: variation.name,
    type: 'variation',
    parentId: variation.folderId ? `folder:${variation.folderId}` : null,
    moveCount: variation.moves.length,
  }));

  const nodes = [...folderNodes, ...variationNodes];
  const edges: MindmapEdge[] = nodes
    .filter((node) => node.parentId)
    .map((node) => ({
      id: `${node.parentId}->${node.id}`,
      from: node.parentId!,
      to: node.id,
    }));

  return { nodes, edges };
}
