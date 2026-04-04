'use client';

import { useHasHydrated } from "@/shared/store/useGameStore";
import { TopicTreeView } from "@/shared/components/TopicTreeView";
import { MindmapCanvas } from "./components/MindmapCanvas";
import { MindmapDetailPanel } from "./components/MindmapDetailPanel";
import { useMindmapNodeSelection } from "./hooks/useMindmapNodeSelection";
import { useMindmapViewportState } from "./hooks/useMindmapViewportState";

export function MindmapScreen() {
  const hydrated = useHasHydrated();
  const { graph, selectedMindmapNodeId, selectedNode, selectMindmapNode } = useMindmapNodeSelection();
  const { zoom, zoomIn, zoomOut, resetZoom } = useMindmapViewportState();

  if (!hydrated) return null;

  return (
    <div className="app-page-shell flex h-[calc(100vh-64px)] w-full bg-background text-on-background overflow-hidden relative">
      <aside className="hidden lg:flex flex-col w-80 bg-slate-100 dark:bg-slate-900 border-r border-outline-variant/30 py-4 font-headline text-sm h-full overflow-hidden">
        <TopicTreeView />
      </aside>

      <MindmapCanvas
        graph={graph}
        selectedNodeId={selectedMindmapNodeId}
        onSelectNode={selectMindmapNode}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />
      <MindmapDetailPanel node={selectedNode} />

      <button className="app-floating-action fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40">
        <span className="material-symbols-outlined text-3xl">account_tree</span>
      </button>
    </div>
  );
}
