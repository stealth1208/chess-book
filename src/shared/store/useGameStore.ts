"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Move } from '@/engine/types';
import { formatMove } from '@/engine/game';
import { handleMalformedReplayFailure } from '@/shared/chessBook/errors/chessBookErrors';
import { buildBoards } from '@/shared/store/services/boardBuilder';
import { useState, useEffect } from 'react';

interface GameStore {
  initialFen: string;
  board: BoardState;
  boards: BoardState[];
  moves: string[];
  currentIndex: number;

  // Actions
  loadVariation: (initialFen: string, moves: string[]) => void;
  applyMove: (moveString: string) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
}

const START_FEN = 'rnbakabnr/9/1c5c1/...' as const;
const START_BOARDS = buildBoards(START_FEN, []);

const getBoardForIndex = (boards: BoardState[], index: number): BoardState =>
  boards[index + 1] ?? boards[0];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      initialFen: START_FEN,
      board: START_BOARDS[0],
      boards: START_BOARDS,
      moves: [],
      currentIndex: -1,

      loadVariation: (initialFen, moves) => {
        const nextMoves = [...moves];
        const nextIndex = nextMoves.length - 1;
        let nextBoards: BoardState[];

        try {
          nextBoards = buildBoards(initialFen, nextMoves);
        } catch (error) {
          console.warn(handleMalformedReplayFailure(error));
          return;
        }

        set({
          initialFen,
          moves: nextMoves,
          currentIndex: nextIndex,
          boards: nextBoards,
          board: getBoardForIndex(nextBoards, nextIndex),
        });
      },

      applyMove: (moveString) => {
        set((state) => {
          const nextMoves = state.moves.slice(0, state.currentIndex + 1);
          nextMoves.push(moveString);

          let nextBoards: BoardState[];
          try {
            nextBoards = buildBoards(state.initialFen, nextMoves);
          } catch (error) {
            console.warn(handleMalformedReplayFailure(error));
            return state;
          }
          const nextIndex = nextMoves.length - 1;

          return {
            moves: nextMoves,
            currentIndex: nextIndex,
            boards: nextBoards,
            board: getBoardForIndex(nextBoards, nextIndex),
          };
        });
      },

      makeMove: (move) => {
        get().applyMove(formatMove(move));
      },

      undo: () => {
        const state = get();
        if (state.currentIndex >= 0) {
          state.jumpTo(state.currentIndex - 1);
        }
      },

      redo: () => {
        const state = get();
        if (state.currentIndex < state.moves.length - 1) {
          state.jumpTo(state.currentIndex + 1);
        }
      },

      jumpTo: (index) => {
        set((state) => {
          if (index < -1 || index >= state.moves.length) return state;

          return {
            board: getBoardForIndex(state.boards, index),
            currentIndex: index,
          };
        });
      },
    }),
    {
      name: 'xiangqi-board-storage',
      partialize: (state) => ({
        initialFen: state.initialFen,
        moves: state.moves,
        currentIndex: state.currentIndex,
      }),
    }
  )
);

/**
 * Centralized hydration hook for board store.
 * Pages just call useHasHydrated().
 */
export const useHasHydrated = () => {
  const [hydrated, setHydrated] = useState(() => {
    const persistApi = (useGameStore as typeof useGameStore & {
      persist?: {
        hasHydrated?: () => boolean;
      };
    }).persist;

    if (!persistApi?.hasHydrated) {
      return true;
    }

    return persistApi.hasHydrated();
  });

  useEffect(() => {
    if (hydrated) {
      return;
    }

    const persistApi = (useGameStore as typeof useGameStore & {
      persist?: {
        hasHydrated?: () => boolean;
        onFinishHydration?: (listener: () => void) => () => void;
      };
    }).persist;

    if (persistApi?.hasHydrated?.()) {
      const timer = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timer);
    }

    if (!persistApi?.onFinishHydration) {
      const timer = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timer);
    }

    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    const fallback = window.setTimeout(() => setHydrated(true), 1500);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, [hydrated]);

  return hydrated;
};

