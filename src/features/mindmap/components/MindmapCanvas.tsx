import type { MindmapGraph } from '@/features/mindmap/mindmapMapper';

interface MindmapCanvasProps {
  graph: MindmapGraph;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function MindmapCanvas({ graph, selectedNodeId, onSelectNode, zoom, onZoomIn, onZoomOut, onResetZoom }: MindmapCanvasProps) {
  return (
    <section
      className="flex-1 relative bg-surface overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, #e2beba 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <div className="bg-surface-container-lowest/80 backdrop-blur-md p-1.5 rounded-xl shadow-sm flex items-center border border-outline-variant/10">
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors" onClick={onZoomIn}><span className="material-symbols-outlined">zoom_in</span></button>
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors" onClick={onZoomOut}><span className="material-symbols-outlined">zoom_out</span></button>
          <div className="w-px h-4 bg-outline-variant mx-1"></div>
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors" onClick={onResetZoom}><span className="material-symbols-outlined">center_focus_strong</span></button>
          <span className="px-2 text-xs text-on-surface-variant">{`${Math.round(zoom * 100)}%`}</span>
        </div>
      </div>

      <div className="w-full h-full overflow-auto p-10" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <div className="min-w-[720px]">
          <svg className="h-16 w-full">
            {graph.edges.slice(0, 20).map((edge, idx) => (
              <line
                key={`${edge.id}-${idx}`}
                x1="50"
                y1="20"
                x2="650"
                y2="20"
                stroke="#b02521"
                strokeOpacity="0.2"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {graph.nodes.slice(0, 100).map((node) => (
              <button
                key={node.id}
                className={`rounded-xl border p-4 text-left transition-all ${
                  node.id === selectedNodeId
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-high'
                }`}
                onClick={() => onSelectNode(node.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-on-surface-variant">{node.type}</span>
                  {typeof node.moveCount === 'number' && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{`${node.moveCount} moves`}</span>
                  )}
                </div>
                <h4 className="mt-2 font-semibold text-on-surface">{node.label}</h4>
                <p className="mt-1 text-[11px] text-on-surface-variant">{node.parentId ? `Parent: ${node.parentId}` : 'Root node'}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
