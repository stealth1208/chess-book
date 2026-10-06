"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Coordinate, Move as EngineMove } from '@/engine/types';
import { createEngine } from '@/engine/engine';
import { formatMoveNotation } from '@/features/engine/notation/formatMoveNotation';
import { moveToUci, normalizeMoves, parseUciMove } from '@/features/engine/notation/moveRecord';
import { Move, StoredMove } from '@/features/engine/notation/notation.types';
import { handleMalformedReplayFailure } from '@/shared/chessBook/errors/chessBookErrors';
import { buildBoards } from '@/shared/store/services/boardBuilder';
import { useState, useEffect } from 'react';

interface GameStore {
  initialFen: string;
  board: BoardState;
  boards: BoardState[];
  moves: Move[];
  currentIndex: number;
  lastError: string | null;

  // Actions
  resetGame: () => void;
  loadVariation: (initialFen: string, moves: StoredMove[]) => void;
  applyMove: (move: StoredMove) => void;
  makeMove: (move: EngineMove) => boolean;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  clearError: () => void;
}

const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r' as const;
const START_BOARDS = buildBoards(START_FEN, []);
const FILE_BASE_CODE = 97;

const coordinateToSquare = (coordinate: Coordinate): string => {
  const file = String.fromCharCode(FILE_BASE_CODE + coordinate.x);
  return `${file}${coordinate.y}`;
};

const getBoardForIndex = (boards: BoardState[], index: number): BoardState =>
  boards[index + 1] ?? boards[0];

const normalizeStoreState = (initialFen: string, moves: StoredMove[], currentIndex: number): {
  moves: Move[];
  boards: BoardState[];
  board: BoardState;
  currentIndex: number;
} => {
  const normalizedMoves = normalizeMoves(initialFen, moves);
  const nextBoards = buildBoards(initialFen, normalizedMoves.map((item) => moveToUci(item)));
  const boundedIndex = Math.min(currentIndex, normalizedMoves.length - 1);

  return {
    moves: normalizedMoves,
    boards: nextBoards,
    board: getBoardForIndex(nextBoards, boundedIndex),
    currentIndex: boundedIndex,
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      initialFen: START_FEN,
      board: START_BOARDS[0],
      boards: START_BOARDS,
      moves: [],
      currentIndex: -1,
      lastError: null,

      resetGame: () => {
        set({
          initialFen: START_FEN,
          board: START_BOARDS[0],
          boards: START_BOARDS,
          moves: [],
          currentIndex: -1,
          lastError: null,
        });
      },

      clearError: () => {
        set({ lastError: null });
      },

      loadVariation: (initialFen, moves) => {
        // Start at position -1 (before first move) so user can replay from beginning
        const nextIndex = -1;

        try {
          const nextState = normalizeStoreState(initialFen, moves, nextIndex);
          set({
            initialFen,
            ...nextState,
            lastError: null,
          });
        } catch (error) {
          console.warn(handleMalformedReplayFailure(error));
        }
      },

      applyMove: (rawMove) => {
        set((state) => {
          const history = state.moves.slice(0, state.currentIndex + 1);
          
          // Warn if we're truncating existing moves
          if (state.currentIndex < state.moves.length - 1 && typeof window !== 'undefined') {
            const discardCount = state.moves.length - state.currentIndex - 1;
            const confirmed = window.confirm(
              `Bạn đang ở giữa dòng kỳ. Nước đi mới sẽ xóa ${discardCount} nước tiếp theo. Tiếp tục?`
            );
            if (!confirmed) {
              return state;
            }
          }
          
          let moveRecord: Move | null = null;

          if (typeof rawMove === 'string') {
            const parsed = parseUciMove(rawMove);
            if (!parsed) {
              return state;
            }

            const movingPiece = state.board[parsed.from.y]?.[parsed.from.x] ?? null;
            if (!movingPiece) {
              return state;
            }

            moveRecord = {
              from: rawMove.slice(0, 2),
              to: rawMove.slice(2, 4),
              piece: movingPiece.type,
              notation: formatMoveNotation(parsed, state.board, movingPiece.color),
              side: movingPiece.color,
              uci: rawMove,
            };
          } else {
            const parsed = parseUciMove(moveToUci(rawMove));
            if (!parsed) {
              return state;
            }

            const movingPiece = state.board[parsed.from.y]?.[parsed.from.x] ?? null;
            const side = movingPiece?.color ?? rawMove.side;
            moveRecord = {
              from: rawMove.from,
              to: rawMove.to,
              piece: movingPiece?.type ?? rawMove.piece,
              notation: rawMove.notation || formatMoveNotation(parsed, state.board, side),
              side,
              uci: moveToUci(rawMove),
            };
          }

          const nextMoves = [...history, moveRecord];

          let nextBoards: BoardState[];
          try {
            nextBoards = buildBoards(state.initialFen, nextMoves.map((item) => moveToUci(item)));
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
        const state = get();
        const movingPiece = state.board[move.from.y]?.[move.from.x] ?? null;
        
        if (!movingPiece) {
          set({ lastError: 'Khong co quan co tai vi tri nay' });
          return false;
        }

        const uci = `${coordinateToSquare(move.from)}${coordinateToSquare(move.to)}`;
        
        const testEngine = createEngine();
        testEngine.load(state.initialFen);
        
        for (const prevMove of state.moves.slice(0, state.currentIndex + 1)) {
          testEngine.applyMoveString(prevMove.uci);
        }
        
        const isValid = testEngine.applyMoveString(uci);
        
        if (!isValid) {
          set({ lastError: 'Nuoc di khong hop le' });
          return false;
        }

        const notation = formatMoveNotation(move, state.board, movingPiece.color);

        state.applyMove({
          from: coordinateToSquare(move.from),
          to: coordinateToSquare(move.to),
          piece: movingPiece.type,
          notation,
          side: movingPiece.color,
          uci,
        });

        set({ lastError: null });
        return true;
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
          // Validate index is an integer
          if (!Number.isInteger(index) || index < -1 || index >= state.moves.length) {
            return state;
          }

          return {
            board: getBoardForIndex(state.boards, index),
            currentIndex: index,
            lastError: null,
          };
        });
      },
    }),
    {
      name: 'xiangqi-board-storage',
      version: 2,
      migrate: (persistedState) => {
        const partial = persistedState as {
          initialFen?: string;
          moves?: StoredMove[];
          currentIndex?: number;
        };

        const initialFen = partial.initialFen ?? START_FEN;
        const moves = partial.moves ?? [];
        const currentIndex = partial.currentIndex ?? -1;
        const normalized = normalizeStoreState(initialFen, moves, currentIndex);

        return {
          initialFen,
          moves: normalized.moves,
          currentIndex: normalized.currentIndex,
          boards: normalized.boards,
          board: normalized.board,
        };
      },
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

