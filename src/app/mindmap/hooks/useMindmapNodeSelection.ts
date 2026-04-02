'use client';

import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function useMindmapNodeSelection() {
  const { getMindmapGraph, selectedMindmapNodeId, selectMindmapNode } = useGameStore();
  const graph = getMindmapGraph();

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedMindmapNodeId) ?? null,
    [graph.nodes, selectedMindmapNodeId]
  );

  return {
    graph,
    selectedMindmapNodeId,
    selectedNode,
    selectMindmapNode,
  };
}
