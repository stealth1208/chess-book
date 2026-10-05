import { useMemo } from 'react';
import { useGameStore } from '@/shared/store/useGameStore';
import { useTopicStore } from '@/shared/store/useTopicStore';

interface MoveListPanelProps {
  variant?: 'analysis' | 'library';
  onSaveVariation?: () => void;
}

export function MoveListPanel({ variant = 'analysis', onSaveVariation }: MoveListPanelProps) {
  const isLibrary = variant === 'library';
  const {
    moves,
    currentIndex,
    jumpTo,
  } = useGameStore();
  const {
    variations,
    selectedVariationId,
  } = useTopicStore();

  const activeVariation = variations.find((variation) => variation.id === selectedVariationId) ?? null;

  const analysisRows = useMemo(() => {
    const rows: Array<{ moveNumber: number; moveNotation: string; isRed: boolean; index: number }> = [];
    for (let i = 0; i < moves.length; i++) {
      const isRed = i % 2 === 0;
      rows.push({
        moveNumber: Math.floor(i / 2) + 1,
        moveNotation: moves[i].notation,
        isRed,
        index: i,
      });
    }
    return rows;
  }, [moves]);

  return (
    <>
      <div className={`${isLibrary ? 'p-6' : 'p-5'} border-b border-outline-variant/10 flex items-center justify-between`}>
        {isLibrary ? (
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-extrabold tracking-tight text-on-surface">Kí phổ</h2>
              <p className="text-xs text-on-surface-variant">
                {activeVariation ? activeVariation.name : 'Chon mot bien trong TopicView de xem lai.'}
              </p>
            </div>
            <span className="rounded bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-tertiary">
              {`So nuoc: ${moves.length}`}
            </span>
          </div>
        ) : (
          <>
            <h3 className="font-headline font-extrabold text-on-surface tracking-tight">Biên bản</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-colors flex items-center" onClick={onSaveVariation}>
                <span className="material-symbols-outlined text-xl">save</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isLibrary ? 'bg-surface-container-low' : 'bg-slate-50/30 dark:bg-slate-950/20'}`}>
        {moves.length === 0 ? (
          <div className="p-4 text-sm text-on-surface-variant">
            {isLibrary ? 'Chua co nuoc di de hien thi.' : 'Di mot vai nuoc tren ban co hoac nhan luu bien de tao bien moi.'}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className={`sticky top-0 z-10 border-b border-outline-variant/20 ${isLibrary ? 'bg-surface-container-low' : 'bg-white dark:bg-slate-900'}`}>
              <tr className={`font-bold text-xs uppercase tracking-wider ${isLibrary ? 'text-on-surface-variant/60 text-[11px]' : 'text-on-surface-variant'}`}>
                <th className="py-3 px-4 text-left">Nước đi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {analysisRows.map((row) => {
                const moveIndex = row.index;
                const isCurrent = currentIndex === moveIndex;
                const moveColor = row.isRed ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200';

                return (
                  <tr
                    key={`${row.moveNumber}-${moveIndex}`}
                    className={`transition-colors ${
                      isCurrent ? 'bg-primary/5' : isLibrary ? '' : 'hover:bg-primary/5 cursor-pointer'
                    }`}
                    onClick={isLibrary ? undefined : () => jumpTo(moveIndex)}
                  >
                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-8 font-bold">{row.isRed ? `${row.moveNumber}.` : ''}</span>
                        <span
                          className={`inline-flex min-w-20 items-center justify-center rounded-full border px-3 py-1 text-sm font-bold ${moveColor} ${
                            isCurrent
                              ? 'border-primary bg-primary/15 shadow-sm'
                              : 'border-outline-variant/40 bg-surface-container-low'
                          }`}
                        >
                          {row.moveNotation}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!isLibrary && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-outline-variant/10 grid grid-cols-2 gap-3 shrink-0">
          <button className="py-3 text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface rounded-xl transition-all">Phân tích sâu</button>
          <button className="py-3 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-lg hover:bg-primary-container transition-all">Thử lại</button>
        </div>
      )}

      {isLibrary && (
        <div className="p-6 bg-surface-container-high/50 border-t border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <h3 className="font-bold text-sm text-on-surface">Ghi chú chiến thuật</h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            {activeVariation
              ? `Bien dang chon: ${activeVariation.name}. Hay tiep tuc bo sung ghi chu chien thuat cho bien nay.`
              : 'Chon mot bien de xem thong tin va ghi chu chien thuat.'}
          </p>
          <div className="flex gap-2">
            <button className="p-2 bg-surface-container-lowest rounded-lg text-outline hover:text-primary transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <button className="p-2 bg-surface-container-lowest rounded-lg text-outline hover:text-primary transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">share</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
