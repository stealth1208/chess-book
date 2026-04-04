import type { MindmapNode } from '@/features/mindmap/mindmapMapper';

interface MindmapDetailPanelProps {
  node: MindmapNode | null;
}

export function MindmapDetailPanel({ node }: MindmapDetailPanelProps) {
  return (
    <aside className="hidden xl:flex flex-col w-96 bg-surface-container-low border-l border-outline-variant/10 p-6 overflow-y-auto h-full shrink-0">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline font-bold text-lg">Chi tiet bien the</h3>
        <button className="p-2 hover:bg-surface-container-high rounded-full"><span className="material-symbols-outlined">close</span></button>
      </div>

      <div className="space-y-6 flex-1">
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Node selected</p>
              <p className="text-xl font-extrabold text-on-surface">{node ? node.label : 'None'}</p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">{node ? `Type: ${node.type}` : 'Chon mot node tren mindmap de xem chi tiet.'}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">memory</span>
              <span className="font-bold text-sm">Thong tin node</span>
            </div>
            <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full font-bold">Readonly</span>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">ID:</span> {node?.id ?? '--'}</p>
            <p><span className="font-semibold">Parent:</span> {node?.parentId ?? 'Root'}</p>
            <p><span className="font-semibold">Moves:</span> {typeof node?.moveCount === 'number' ? node.moveCount : '--'}</p>
          </div>
        </div>
      </div>

      <button className="mt-4 shrink-0 bg-surface-container-highest text-on-surface w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm">
        <span className="material-symbols-outlined">auto_stories</span>
        Xem tai lieu chi tiet
      </button>
    </aside>
  );
}
