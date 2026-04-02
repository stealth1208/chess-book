import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLibraryVariationLoad } from '@/app/library/hooks/useLibraryVariationLoad';

interface MoveListPanelProps {
  variant?: 'analysis' | 'library';
}

export function MoveListPanel({ variant = 'analysis' }: MoveListPanelProps) {
  const isLibrary = variant === 'library';
  const { selectedVariationId, loadVariationById } = useLibraryVariationLoad();
  const {
    moves,
    currentIndex,
    jumpTo,
    variations,
    selectedFolderId,
    deleteVariation,
    renameVariation,
    getVariationsForFolder,
  } = useGameStore();

  const libraryVariations = getVariationsForFolder(selectedFolderId);

  const activeVariation = variations.find((variation) => variation.id === selectedVariationId) ?? null;

  const analysisRows = useMemo(() => {
    const rows: Array<{ idx: number; red?: string; black?: string }> = [];
    for (let i = 0; i < moves.length; i += 2) {
      rows.push({
        idx: i / 2,
        red: moves[i],
        black: moves[i + 1],
      });
    }
    return rows;
  }, [moves]);

  return (
    <>
      {/* Header */}
      <div className={`p-${isLibrary ? '6' : '5'} border-b border-outline-variant/10 flex justify-between items-center`}>
        {isLibrary ? (
          <>
            <div className="flex justify-between items-center w-full mb-4">
              <h2 className="font-headline font-extrabold text-lg text-on-surface tracking-tight">Kí phổ</h2>
              <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase tracking-wider">{`So bien: ${libraryVariations.length}`}</span>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-headline font-extrabold text-on-surface tracking-tight">Biên bản</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-xl">download</span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-colors flex items-center">
                <span className="material-symbols-outlined text-xl">save</span>
              </button>
            </div>
          </>
        )}
      </div>

      {isLibrary && (
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <button className="flex-1 py-2 text-sm font-bold bg-surface-container-highest rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">Chi tiết</button>
            <button className="flex-1 py-2 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-md hover:opacity-90 transition-all">Biến thể</button>
          </div>
        </div>
      )}

      {/* Move Table */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isLibrary ? 'bg-surface-container-low' : 'bg-slate-50/30 dark:bg-slate-950/20'}`}>
        {isLibrary ? (
          <div className="space-y-2 p-4">
            {libraryVariations.length === 0 && (
              <p className="text-sm text-on-surface-variant">Khong co bien nao trong thu muc nay.</p>
            )}

            {libraryVariations.map((variation) => (
              <div
                key={variation.id}
                className={`rounded-xl border p-3 ${
                  variation.id === selectedVariationId
                    ? 'border-primary bg-primary/10'
                    : 'border-outline-variant/20 bg-surface-container-lowest'
                }`}
              >
                <button className="w-full text-left" onClick={() => loadVariationById(variation.id)}>
                  <div className="font-semibold text-on-surface">{variation.name}</div>
                  <div className="text-xs text-on-surface-variant">{`So nuoc: ${variation.moves.length}`}</div>
                </button>
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    className="rounded bg-surface-container-high px-2 py-1"
                    onClick={() => {
                      const nextName = window.prompt('Doi ten bien', variation.name);
                      if (nextName && nextName.trim()) {
                        renameVariation(variation.id, nextName);
                      }
                    }}
                  >
                    Doi ten
                  </button>
                  <button className="rounded bg-error/10 px-2 py-1 text-error" onClick={() => deleteVariation(variation.id)}>
                    Xoa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className={`sticky top-0 z-10 border-b border-outline-variant/20 ${isLibrary ? 'bg-surface-container-low' : 'bg-white dark:bg-slate-900'}`}>
              <tr className={`font-bold text-xs uppercase tracking-wider ${isLibrary ? 'text-on-surface-variant/60 text-[11px]' : 'text-on-surface-variant'}`}>
                <th className="py-3 px-4 text-left w-12">STT</th>
                <th className="py-3 px-2 text-center">Đỏ</th>
                <th className="py-3 px-2 text-center">Đen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {analysisRows.map((row) => {
                const isCurrent = currentIndex >= row.idx * 2 && currentIndex <= row.idx * 2 + 1;
                return (
                  <tr key={row.idx} className={`cursor-pointer transition-colors ${isCurrent ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-primary/5'}`}>
                    <td className="py-3 px-4 font-bold text-on-surface-variant/60">{`${row.idx + 1}.`}</td>
                    <td className="py-3 px-2 text-center font-bold text-on-surface" onClick={() => jumpTo(row.idx * 2)}>{row.red ?? '-'}</td>
                    <td className="py-3 px-2 text-center font-bold text-on-surface" onClick={() => jumpTo(row.idx * 2 + 1)}>{row.black ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
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
