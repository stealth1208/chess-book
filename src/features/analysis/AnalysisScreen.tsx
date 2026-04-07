'use client';

import { useMemo, useState } from 'react';
import { useGameStore, useHasHydrated } from "@/shared/store/useGameStore";
import { useTopicStore } from "@/shared/store/useTopicStore";
import { Board } from "@/shared/components/Board/Board";
import { MoveListPanel } from "@/shared/components/MoveListPanel";
import { InputNotation } from "@/shared/components/InputNotation";
import { NewVariationModal } from "@/shared/components/NewVariationModal";
import { ChessBookLoadingBoundary } from "@/shared/components/ChessBookLoadingBoundary";
import { TopicView } from "@/features/TopicView";

type ModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  variationId: string | null;
};

export function AnalysisScreen() {
  const {
    board,
    makeMove,
    undo,
    redo,
    jumpTo,
    moves,
    currentIndex,
    initialFen,
  } = useGameStore();
  const {
    selectedFolderId,
    variations,
    renameVariation,
    deleteVariation,
    moveVariationToFolder,
    saveVariation: saveTopicVariation,
  } = useTopicStore();
  const hydrated = useHasHydrated();
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mode: 'create', variationId: null });

  const editingVariation = useMemo(
    () => variations.find((variation) => variation.id === modalState.variationId) ?? null,
    [modalState.variationId, variations]
  );

  const openCreateModal = () => {
    setModalState({ isOpen: true, mode: 'create', variationId: null });
  };

  const openEditModal = (variationId: string) => {
    setModalState({ isOpen: true, mode: 'edit', variationId });
  };

  const closeModal = () => {
    setModalState((state) => ({ ...state, isOpen: false }));
  };

  const saveVariation = ({ name, folderId }: { name: string; description: string; folderId: string | null }) => {
    if (modalState.mode === 'edit' && editingVariation) {
      renameVariation(editingVariation.id, name);
      if (editingVariation.folderId !== folderId) {
        moveVariationToFolder(editingVariation.id, folderId);
      }
      closeModal();
      return;
    }

    saveTopicVariation(name, initialFen, moves, folderId ?? selectedFolderId ?? null);
    closeModal();
  };

  const deleteCurrentVariation = () => {
    if (!editingVariation) {
      return;
    }

    deleteVariation(editingVariation.id);
    closeModal();
  };

  return (
    <ChessBookLoadingBoundary isReady={hydrated}>
      <div className="app-page-shell flex h-full w-full flex-col overflow-hidden bg-surface text-on-surface xl:flex-row">
        <aside className="order-1 flex w-full shrink-0 flex-col border-t border-outline-variant/20 bg-white xl:order-1 xl:w-[380px] xl:border-r xl:border-t-0 dark:bg-slate-900">
          <div className="min-h-[280px] flex-1 xl:min-h-0 xl:flex-[1.2]">
            <TopicView onEditVariation={openEditModal} />
          </div>
          <div className="border-t border-outline-variant/10">
            <InputNotation compact onConfirm={openCreateModal} />
          </div>
        </aside>

        <section className="app-main-section flex-1 overflow-y-auto p-6 md:p-8 xl:order-2">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-6">
            <div className="app-board-container rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-xl dark:bg-slate-900">
              <Board board={board} onMove={makeMove} interactive />
            </div>

            <div className="app-control-bar flex w-full max-w-md items-center justify-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 shadow-sm">
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90" onClick={() => jumpTo(-1)}>
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90" onClick={undo}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl transition-all hover:bg-primary-container active:scale-95" onClick={() => {
                if (currentIndex < moves.length - 1) {
                  redo();
                }
              }}>
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90" onClick={redo}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90" onClick={() => jumpTo(moves.length - 1)}>
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="order-2 flex w-full shrink-0 flex-col border-t border-outline-variant/20 bg-white xl:order-3 xl:w-[320px] xl:border-l xl:border-t-0 dark:bg-slate-900">
          <div className="min-h-[280px] xl:h-full xl:min-h-0">
            <MoveListPanel variant="analysis" onSaveVariation={openCreateModal} />
          </div>
        </aside>

        <NewVariationModal
          key={`${modalState.mode}:${modalState.variationId ?? 'create'}:${modalState.isOpen ? 'open' : 'closed'}`}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          initialName={editingVariation?.name ?? ''}
          initialMoves={editingVariation?.moves ?? moves}
          initialFolderId={editingVariation?.folderId ?? selectedFolderId ?? null}
          onSubmit={saveVariation}
          onDelete={modalState.mode === 'edit' ? deleteCurrentVariation : undefined}
        />
      </div>
    </ChessBookLoadingBoundary>
  );
}
