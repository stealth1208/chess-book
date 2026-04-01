import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Move } from '@/engine/types';
import { createInitialBoard } from '@/engine/board';
import { validateMove } from '@/engine/rules';
import { formatMove, parseMove, parseFEN } from '@/engine/game';
import { createFolderItem, deleteFolderItem, renameFolderItem } from '@/features/library/folderService';
import { createVariationItem, deleteVariationItem, deleteVariationsByFolderIds, renameVariationItem } from '@/features/library/variationService';
import { mapStudyToMindmap, MindmapGraph } from '@/features/mindmap/mindmapMapper';
import { evaluatePracticeMove } from '@/features/practice/practiceEvaluator';
import { studyStorageService } from '@/features/storage/studyStorageService';
import type { Folder, Variation } from '@/features/types/study';
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
  practiceVariationId: string | null;
  practiceExpectedMoves: string[];
  practiceIndex: number;
  practiceCorrect: number;
  practiceWrong: number;
  selectedMindmapNodeId: string | null;
  authUserId: string | null;

  // Actions
  loadVariation: (initialFen: string, moves: string[]) => void;
  loadVariationById: (variationId: string) => void;
  applyMove: (moveString: string) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  jumpToMove: (index: number) => void;
  reset: () => void;
  createFolder: (name: string, parentId?: string | null) => void;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  selectFolder: (folderId: string | null) => void;
  saveCurrentVariation: (name: string, folderId?: string | null) => void;
  renameVariation: (variationId: string, name: string) => void;
  deleteVariation: (variationId: string) => void;
  selectVariation: (variationId: string | null) => void;
  startPractice: (variationId: string) => void;
  submitPracticeMove: (moveString: string) => 'correct' | 'wrong' | 'invalid';
  resetPractice: () => void;
  selectMindmapNode: (nodeId: string | null) => void;
  getMindmapGraph: () => MindmapGraph;
  getVariationsForFolder: (folderId: string | null) => Variation[];
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

let cachedMindmapSignature = '';
let cachedMindmapGraph: MindmapGraph = { nodes: [], edges: [] };
let cachedFolderId: string | null = null;
let cachedVariationSignature = '';
let cachedVariationsForFolder: Variation[] = [];

const getMemoizedMindmap = (folders: Folder[], variations: Variation[]): MindmapGraph => {
  const signature = JSON.stringify({
    f: folders.map((folder) => [folder.id, folder.parentId, folder.name, folder.updatedAt]),
    v: variations.map((variation) => [variation.id, variation.folderId, variation.name, variation.updatedAt, variation.moves.length]),
  });

  if (signature === cachedMindmapSignature) {
    return cachedMindmapGraph;
  }

  cachedMindmapSignature = signature;
  cachedMindmapGraph = mapStudyToMindmap(folders, variations);
  return cachedMindmapGraph;
};

const getMemoizedVariationsForFolder = (variations: Variation[], folderId: string | null): Variation[] => {
  const signature = JSON.stringify(variations.map((variation) => [variation.id, variation.folderId, variation.updatedAt]));

  if (signature === cachedVariationSignature && folderId === cachedFolderId) {
    return cachedVariationsForFolder;
  }

  cachedVariationSignature = signature;
  cachedFolderId = folderId;
  cachedVariationsForFolder = folderId
    ? variations.filter((variation) => variation.folderId === folderId)
    : variations;

  return cachedVariationsForFolder;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createSeedLibrary(),
      initialFen: START_FEN,
      board: createInitialBoard(),
      moves: [],
      currentIndex: -1,
      practiceVariationId: null,
      practiceExpectedMoves: [],
      practiceIndex: 0,
      practiceCorrect: 0,
      practiceWrong: 0,
      selectedMindmapNodeId: null,
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

        set({
          selectedVariationId: variationId,
          selectedFolderId: variation.folderId,
        });
        get().loadVariation(variation.initialFen, variation.moves);
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

          if (!validateMove(fromCurrentBoard, parsedMove)) {
            return state;
          }

          const nextMoves = state.moves.slice(0, state.currentIndex + 1);
          nextMoves.push(moveString);
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

      jumpToMove: (index) => {
        get().jumpTo(index);
      },

      reset: () => {
        set((state) => ({
          moves: [],
          currentIndex: -1,
          board: rebuildBoard(state.initialFen, [], -1),
        }));
      },

      createFolder: (name, parentId = null) => {
        set((state) => ({
          folders: [...state.folders, createFolderItem(name, parentId)],
        }));
      },

      renameFolder: (folderId, name) => {
        set((state) => ({
          folders: renameFolderItem(state.folders, folderId, name),
        }));
      },

      deleteFolder: (folderId) => {
        set((state) => {
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
      },

      renameVariation: (variationId, name) => {
        set((state) => ({
          variations: renameVariationItem(state.variations, variationId, name),
        }));
      },

      deleteVariation: (variationId) => {
        set((state) => ({
          variations: deleteVariationItem(state.variations, variationId),
          selectedVariationId: state.selectedVariationId === variationId ? null : state.selectedVariationId,
        }));
      },

      selectVariation: (variationId) => {
        set({ selectedVariationId: variationId });
      },

      startPractice: (variationId) => {
        const variation = get().variations.find((item) => item.id === variationId);
        if (!variation) {
          return;
        }

        set({
          practiceVariationId: variation.id,
          practiceExpectedMoves: [...variation.moves],
          practiceIndex: 0,
          practiceCorrect: 0,
          practiceWrong: 0,
          selectedVariationId: variation.id,
        });

        get().loadVariation(variation.initialFen, []);
      },

      submitPracticeMove: (moveString) => {
        const state = get();
        const expectedMove = state.practiceExpectedMoves[state.practiceIndex];

        if (!expectedMove) {
          return 'invalid';
        }

        if (evaluatePracticeMove(moveString, expectedMove) === 'correct') {
          get().applyMove(moveString);
          set((current) => ({
            practiceIndex: current.practiceIndex + 1,
            practiceCorrect: current.practiceCorrect + 1,
          }));
          return 'correct';
        }

        set((current) => ({
          practiceWrong: current.practiceWrong + 1,
          practiceIndex: 0,
          moves: [],
          currentIndex: -1,
          board: rebuildBoard(current.initialFen, [], -1),
        }));

        return 'wrong';
      },

      resetPractice: () => {
        set((state) => ({
          practiceIndex: 0,
          practiceCorrect: 0,
          practiceWrong: 0,
          moves: [],
          currentIndex: -1,
          board: rebuildBoard(state.initialFen, [], -1),
        }));
      },

      selectMindmapNode: (nodeId) => {
        set({ selectedMindmapNodeId: nodeId });
      },

      getMindmapGraph: () => {
        const state = get();
        return getMemoizedMindmap(state.folders, state.variations);
      },

      getVariationsForFolder: (folderId) => {
        const state = get();
        return getMemoizedVariationsForFolder(state.variations, folderId);
      },

      setAuthUser: (userId) => {
        if (userId) {
          studyStorageService.setUserMode(userId);
        } else {
          studyStorageService.setGuestMode();
        }

        set({ authUserId: userId });
      },

      syncLibraryFromStorage: async () => {
        const snapshot = await studyStorageService.loadSnapshot();
        set((state) => ({
          folders: snapshot.folders,
          variations: snapshot.variations,
          selectedFolderId: state.selectedFolderId ?? snapshot.folders[0]?.id ?? null,
          selectedVariationId: state.selectedVariationId ?? snapshot.variations[0]?.id ?? null,
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
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) {
      return;
    }

    // Wait for persist hydration to complete.
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  return hydrated;
};

