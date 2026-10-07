'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { useGameStore, useHasHydrated } from "@/shared/store/useGameStore";
import { useTopicStore } from "@/shared/store/useTopicStore";
import { Board } from "@/shared/components/Board/Board";
import { MoveListPanel } from "@/shared/components/MoveListPanel";
import { InputNotation } from "@/shared/components/InputNotation";
import { NewVariationModal } from "@/shared/components/NewVariationModal";
import { ChessBookLoadingBoundary } from "@/shared/components/ChessBookLoadingBoundary";
import { TopicView } from "@/features/TopicView";

export function AnalysisScreen() {
  const {
    board,
    resetGame,
    makeMove,
    undo,
    redo,
    jumpTo,
    moves,
    currentIndex,
    clearError,
  } = useGameStore();
  
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMove = (move: Parameters<typeof makeMove>[0]) => {
    const success = makeMove(move);
    if (!success) {
      const currentError = useGameStore.getState().lastError;
      if (currentError) {
        notifications.show({
          title: 'Nuoc di khong hop le',
          message: currentError,
          color: 'red',
        });
        clearError();
      }
    }
  };
  
  // Auto-play functionality
  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);
  
  const startAutoPlay = useCallback(() => {
    if (currentIndex >= moves.length - 1) {
      return; // Already at the end
    }
    
    setIsAutoPlaying(true);
    autoPlayTimerRef.current = setInterval(() => {
      const state = useGameStore.getState();
      if (state.currentIndex >= state.moves.length - 1) {
        stopAutoPlay();
      } else {
        state.redo();
      }
    }, 1000); // 1 second per move
  }, [currentIndex, moves.length, stopAutoPlay]);
  
  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);
  
  // Cleanup auto-play on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          undo();
          break;
        case 'ArrowRight':
          e.preventDefault();
          redo();
          break;
        case 'Home':
          e.preventDefault();
          jumpTo(-1);
          break;
        case 'End':
          e.preventDefault();
          jumpTo(moves.length - 1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, jumpTo, moves.length]);
  const {
    selectedVariationId,
    clearSelectionState,
    editVariationId,
    setEditVariationId,
  } = useTopicStore();
  const hydrated = useHasHydrated();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmedNotation, setConfirmedNotation] = useState('');
  
  // Track previous selectedVariationId to detect deselection transitions
  const prevSelectedVariationIdRef = useRef<string | null>(undefined as any);

  const openCreateModal = () => {
    setEditVariationId(null);
    setConfirmedNotation('');
    setIsModalOpen(true);
  };

  const openCreateModalFromNotation = (notation: string) => {
    setEditVariationId(null);
    setConfirmedNotation(notation.trim());
    setIsModalOpen(true);
  };

  const openEditModal = (variationId: string) => {
    setConfirmedNotation('');
    setEditVariationId(variationId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    clearSelectionState();
  }, [clearSelectionState]);

  useEffect(() => {
    // Only reset when user explicitly deselects a variation (non-null → null transition)
    // Don't reset on initial mount (prevRef is undefined) or when rehydration is still loading
    const prevId = prevSelectedVariationIdRef.current;
    
    if (hydrated && prevId !== undefined && prevId !== null && selectedVariationId === null) {
      // Actual deselection: was selected, now null
      resetGame();
    }
    
    // Update ref for next render
    prevSelectedVariationIdRef.current = selectedVariationId;
  }, [selectedVariationId, resetGame, hydrated]);

  return (
    <ChessBookLoadingBoundary isReady={hydrated}>
      <div className="app-page-shell flex h-full w-full flex-col overflow-hidden bg-surface text-on-surface xl:flex-row">
        <aside className="order-1 flex w-full shrink-0 flex-col border-t border-outline-variant/20 bg-white xl:order-1 xl:w-[380px] xl:border-r xl:border-t-0 dark:bg-slate-900">
          <div className="min-h-[280px] flex-1 xl:min-h-0 xl:flex-[1.2]">
            <TopicView onEditVariation={openEditModal} />
          </div>
          <div className="border-t border-outline-variant/10">
            <InputNotation compact onConfirm={openCreateModalFromNotation} />
          </div>
        </aside>

        <section className="app-main-section flex-1 overflow-y-auto p-6 md:p-8 xl:order-2">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-6">
            <div className="app-board-container rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-xl dark:bg-slate-900">
              <Board board={board} onMove={handleMove} interactive />
            </div>

            <div className="app-control-bar flex w-full max-w-md items-center justify-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-5 py-3 shadow-sm">
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => jumpTo(-1)}
                disabled={currentIndex === -1}
                aria-label="Về đầu"
              >
                <span className="material-symbols-outlined">first_page</span>
              </button>
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={undo}
                disabled={currentIndex < 0}
                aria-label="Lùi lại"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={toggleAutoPlay}
                disabled={currentIndex >= moves.length - 1 && !isAutoPlaying}
                aria-label={isAutoPlaying ? "Tạm dừng" : "Tự động phát"}
              >
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isAutoPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={redo}
                disabled={currentIndex >= moves.length - 1}
                aria-label="Tiến lên"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button 
                className="flex h-12 w-12 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => jumpTo(moves.length - 1)}
                disabled={currentIndex >= moves.length - 1}
                aria-label="Về cuối"
              >
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
          key={`${editVariationId ?? 'create'}:${isModalOpen ? 'open' : 'closed'}`}
          isOpen={isModalOpen}
          currentNotation={confirmedNotation}
          onClose={closeModal}
        />
      </div>
    </ChessBookLoadingBoundary>
  );
}
