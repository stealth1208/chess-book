"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Move } from '@/engine/types';
import { createInitialBoard } from '@/engine/board';
import { formatMove, parseMove, parseFEN } from '@/engine/game';
import { chessBookStorageService } from '@/infrastructure/storage/chessBookStorageService';
import type { Folder, Variation } from '@/shared/chessBook/types/chessBook';
import { handleMalformedReplayFailure } from '@/shared/chessBook/errors/chessBookErrors';
import { createFolderItem, deleteFolderItem, renameFolderItem } from '@/shared/store/services/folderService';
import { createVariationItem, deleteVariationItem, deleteVariationsByFolderIds, moveVariationToFolderItem, renameVariationItem } from '@/shared/store/services/variationService';
import { useState, useEffect } from 'react';

interface GameStore {
  initialFen: string;
  board: BoardState;
  moves: string[];
  currentIndex: number;
  folders: Folder[];
  variations: Variation[];
  selectedFolderId: string | null;
  selectedVariationId: string | null;
  authUserId: string | null;

  // Actions
  loadVariation: (initialFen: string, moves: string[]) => void;
  loadVariationById: (variationId: string) => void;
  applyMove: (moveString: string) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  createFolder: (name: string, parentId?: string | null) => void;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  selectFolder: (folderId: string | null) => void;
  saveCurrentVariation: (name: string, folderId?: string | null) => void;
  renameVariation: (variationId: string, name: string) => void;
  deleteVariation: (variationId: string) => void;
  moveVariationToFolder: (variationId: string, folderId: string | null) => void;
  setAuthUser: (userId: string | null) => void;
  syncLibraryFromStorage: () => Promise<void>;
}

const START_FEN = 'rnbakabnr/9/1c5c1/...' as const;

const createSeedLibrary = (): Pick<GameStore, 'folders' | 'variations' | 'selectedFolderId' | 'selectedVariationId'> => {
  const rootFolder = createFolderItem('Khai cuoc Phao Dau', null);
  const sampleVariation = createVariationItem({
    name: 'Bien co ban',
    initialFen: START_FEN,
    moves: ['b0c2', 'h9g7'],
    folderId: rootFolder.id,
  });

  return {
    folders: [rootFolder],
    variations: [sampleVariation],
    selectedFolderId: rootFolder.id,
    selectedVariationId: sampleVariation.id,
  };
};

const applyMoveStringToBoard = (board: BoardState, moveString: string): BoardState => {
  const parsed = parseMove(moveString);
  const piece = board[parsed.from.y]?.[parsed.from.x] ?? null;

  if (!piece) {
    return board;
  }

  const nextBoard = board.map((row) => [...row]);
  nextBoard[parsed.to.y][parsed.to.x] = piece;
  nextBoard[parsed.from.y][parsed.from.x] = null;
  return nextBoard;
};

const rebuildBoard = (initialFen: string, moves: string[], currentIndex: number): BoardState => {
  let rebuilt = parseFEN(initialFen);

  for (let i = 0; i <= currentIndex; i += 1) {
    rebuilt = applyMoveStringToBoard(rebuilt, moves[i]);
  }

  return rebuilt;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createSeedLibrary(),
      initialFen: START_FEN,
      board: createInitialBoard(),
      moves: [],
      currentIndex: -1,
      authUserId: null,

      loadVariation: (initialFen, moves) => {
        const nextMoves = [...moves];
        const nextIndex = nextMoves.length - 1;
        set({
          initialFen,
          moves: nextMoves,
          currentIndex: nextIndex,
          board: rebuildBoard(initialFen, nextMoves, nextIndex),
        });
      },

      loadVariationById: (variationId) => {
        const variation = get().variations.find((item) => item.id === variationId);
        if (!variation) {
          return;
        }

        try {
          set({
            selectedVariationId: variationId,
            selectedFolderId: variation.folderId,
          });
          get().loadVariation(variation.initialFen, variation.moves);
        } catch (error) {
          console.warn(handleMalformedReplayFailure(error));
        }
      },

      applyMove: (moveString) => {
        set((state) => {
          const fromCurrentBoard = rebuildBoard(state.initialFen, state.moves, state.currentIndex);
          const parsed = parseMove(moveString);
          const piece = fromCurrentBoard[parsed.from.y]?.[parsed.from.x] ?? null;

          if (!piece) {
            return state;
          }

          const parsedMove: Move = {
            from: parsed.from,
            to: parsed.to,
            piece,
          };

          const nextMoves = state.moves.slice(0, state.currentIndex + 1);
          nextMoves.push(formatMove(parsedMove));
          const nextIndex = nextMoves.length - 1;

          return {
            moves: nextMoves,
            currentIndex: nextIndex,
            board: rebuildBoard(state.initialFen, nextMoves, nextIndex),
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
            board: rebuildBoard(state.initialFen, state.moves, index),
            currentIndex: index,
          };
        });
      },

      createFolder: (name, parentId = null) => {
        set((state) => ({
          folders: [...state.folders, createFolderItem(name, parentId)],
        }));
        chessBookStorageService.saveFolders(get().folders).catch(console.error);
      },

      renameFolder: (folderId, name) => {
        set((state) => ({
          folders: renameFolderItem(state.folders, folderId, name),
        }));
        chessBookStorageService.saveFolders(get().folders).catch(console.error);
      },

      deleteFolder: (folderId) => {
        set((state) => {
          const hasChildFolder = state.folders.some((folder) => folder.parentId === folderId);
          const hasVariations = state.variations.some((variation) => variation.folderId === folderId);

          if (hasChildFolder || hasVariations) {
            console.warn('Cannot delete non-empty folder.');
            return state;
          }

          const { nextFolders, deletedIds } = deleteFolderItem(state.folders, folderId);
          const nextVariations = deleteVariationsByFolderIds(state.variations, deletedIds);
          const nextSelectedFolderId = state.selectedFolderId && deletedIds.has(state.selectedFolderId)
            ? null
            : state.selectedFolderId;
          const nextSelectedVariationId = state.selectedVariationId &&
            !nextVariations.some((variation) => variation.id === state.selectedVariationId)
            ? null
            : state.selectedVariationId;

          return {
            folders: nextFolders,
            variations: nextVariations,
            selectedFolderId: nextSelectedFolderId,
            selectedVariationId: nextSelectedVariationId,
          };
        });
        chessBookStorageService.saveFolders(get().folders).catch(console.error);
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      selectFolder: (folderId) => {
        set({ selectedFolderId: folderId });
      },

      saveCurrentVariation: (name, folderId = null) => {
        set((state) => {
          const nextVariation = createVariationItem({
            name,
            initialFen: state.initialFen,
            moves: state.moves,
            folderId,
          });

          return {
            variations: [...state.variations, nextVariation],
            selectedVariationId: nextVariation.id,
          };
        });
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      renameVariation: (variationId, name) => {
        set((state) => ({
          variations: renameVariationItem(state.variations, variationId, name),
        }));
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      deleteVariation: (variationId) => {
        set((state) => ({
          variations: deleteVariationItem(state.variations, variationId),
          selectedVariationId: state.selectedVariationId === variationId ? null : state.selectedVariationId,
        }));
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      moveVariationToFolder: (variationId, folderId) => {
        set((state) => ({
          variations: moveVariationToFolderItem(state.variations, variationId, folderId),
        }));
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      setAuthUser: (userId) => {
        if (get().authUserId === userId) {
          return;
        }

        if (userId) {
          chessBookStorageService.setUserMode(userId);
        } else {
          chessBookStorageService.setGuestMode();
        }

        set({ authUserId: userId });
      },

      syncLibraryFromStorage: async () => {
        const snapshot = await chessBookStorageService.loadSnapshot();
        const currentState = get();
        if (snapshot.folders.length === 0 && currentState.folders.length > 0) {
          await chessBookStorageService.saveFolders(currentState.folders).catch(console.error);
          await chessBookStorageService.saveVariations(currentState.variations).catch(console.error);
          return;
        }

        const nextSelectedFolderId = currentState.selectedFolderId ?? snapshot.folders[0]?.id ?? null;
        const nextSelectedVariationId = currentState.selectedVariationId ?? snapshot.variations[0]?.id ?? null;
        const selectedVariation = snapshot.variations.find((variation) => variation.id === nextSelectedVariationId) ?? null;

        set((state) => ({
          folders: snapshot.folders,
          variations: snapshot.variations,
          selectedFolderId: nextSelectedFolderId,
          selectedVariationId: nextSelectedVariationId,
          initialFen: selectedVariation?.initialFen ?? state.initialFen,
          moves: selectedVariation ? [...selectedVariation.moves] : state.moves,
          currentIndex: selectedVariation ? selectedVariation.moves.length - 1 : state.currentIndex,
          board: selectedVariation
            ? rebuildBoard(selectedVariation.initialFen, selectedVariation.moves, selectedVariation.moves.length - 1)
            : state.board,
        }));
      },
    }),
    {
      name: 'xiangqi-storage',
    }
  )
);

/**
 * Centralized hydration hook — pages just call useHasHydrated().
 * Uses Zustand's official persist API (no extra state in the store).
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

    // Re-check current hydration status in case it completed before subscription.
    if (persistApi?.hasHydrated?.()) {
      const timer = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timer);
    }

    if (!persistApi?.onFinishHydration) {
      const timer = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timer);
    }

    // Wait for persist hydration to complete.
    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    const fallback = window.setTimeout(() => setHydrated(true), 1500);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, [hydrated]);

  return hydrated;
};

