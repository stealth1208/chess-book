'use client';

import { useEffect, useState } from 'react';
import { useGameStore, useHasHydrated } from "@/shared/store/useGameStore";
import { useTopicStore } from "@/shared/store/useTopicStore";
import { Board } from "@/shared/components/Board/Board";
import { MoveListPanel } from "@/shared/components/MoveListPanel";
import { NewVariationModal } from "@/shared/components/NewVariationModal";
import { ChessBookLoadingBoundary } from "@/shared/components/ChessBookLoadingBoundary";
import { TopicView } from "@/features/TopicView";

export function LibraryScreen() {
  const {
    board,
    resetGame,
    moves,
    currentIndex,
  } = useGameStore();
  const {
    selectedVariationId,
    clearSelectionState,
    variations,
    editVariationId,
    setEditVariationId,
    renameVariation,
    deleteVariation,
    moveVariationToFolder,
  } = useTopicStore();
  const hydrated = useHasHydrated();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    clearSelectionState();
    resetGame();
  }, [clearSelectionState, resetGame]);

  useEffect(() => {
    if (!selectedVariationId) {
      resetGame();
    }
  }, [selectedVariationId, resetGame]);

  const openEditModal = (variationId: string) => {
    setEditVariationId(variationId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveVariation = ({ name, folderId }: { name: string; description: string; folderId: string | null }) => {
    if (!editVariationId) {
      return;
    }

    const variation = variations.find((v) => v.id === editVariationId);
    if (!variation) {
      return;
    }

    renameVariation(variation.id, name);
    if (variation.folderId !== folderId) {
      moveVariationToFolder(variation.id, folderId);
    }
  };

  const deleteCurrentVariation = () => {
    if (!editVariationId) {
      return;
    }

    const variation = variations.find((v) => v.id === editVariationId);
    if (variation) {
      deleteVariation(variation.id);
    }
  };

  return (
    <ChessBookLoadingBoundary isReady={hydrated}>
      <div className="app-page-shell flex h-full w-full flex-col overflow-hidden bg-surface text-on-surface xl:flex-row">
        <aside className="order-1 flex w-full shrink-0 flex-col border-t border-outline-variant/20 bg-white xl:order-1 xl:w-[380px] xl:border-r xl:border-t-0 dark:bg-slate-900">
          <div className="min-h-[280px] flex-1 xl:min-h-0 xl:flex-[1.2]">
            <TopicView onEditVariation={openEditModal} />
          </div>
          <div className="border-t border-outline-variant/10 p-4 text-sm text-on-surface-variant">
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
              <div className="font-semibold text-on-surface">Chế độ thư viện</div>
              <p className="mt-2 text-xs leading-relaxed">
                Biến đang mở được hiển thị ở chế độ chỉ xem. Hãy chọn biến trong TopicView để phát lại từ vị trí gốc.
              </p>
              <p className="mt-2 text-xs">{`So nuoc dang nap: ${moves.length} | Vi tri hien tai: ${Math.max(currentIndex + 1, 0)}`}</p>
            </div>
          </div>
        </aside>

        <section className="app-main-section flex-1 overflow-y-auto p-6 md:p-8 xl:order-2">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-6">
            <div className="app-board-container relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-white p-8 shadow-xl overflow-hidden">
              <Board board={board} interactive={false} />
            </div>

            <div className="app-control-bar flex w-full max-w-md items-center justify-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 shadow-sm opacity-60">
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" disabled>
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant" disabled>
                <span className="material-symbols-outlined text-4xl">play_arrow</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" disabled>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant" disabled>
                <span className="material-symbols-outlined">last_page</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="order-2 flex w-full shrink-0 flex-col border-t border-outline-variant/20 bg-white xl:order-3 xl:w-[320px] xl:border-l xl:border-t-0 dark:bg-slate-900">
          <div className="min-h-[280px] xl:h-full xl:min-h-0">
            <MoveListPanel variant="library" />
          </div>
        </aside>

        <NewVariationModal
          key={`library:${editVariationId ?? 'none'}:${isModalOpen ? 'open' : 'closed'}`}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={saveVariation}
          onDelete={deleteCurrentVariation}
        />
      </div>
    </ChessBookLoadingBoundary>
  );
}
