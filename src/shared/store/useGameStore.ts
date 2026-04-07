"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Move } from '@/engine/types';
import { formatMove } from '@/engine/game';
import { chessBookStorageService } from '@/infrastructure/storage/chessBookStorageService';
import type { Folder, Topic, Variation } from '@/shared/chessBook/types/chessBook';
import { handleMalformedReplayFailure } from '@/shared/chessBook/errors/chessBookErrors';
import { buildBoards } from '@/shared/store/services/boardBuilder';
import { createFolderItem, createTopicItem, deleteFolderItem, renameFolderItem } from '@/shared/store/services/folderService';
import { createVariationItem, deleteVariationItem, deleteVariationsByFolderIds, moveVariationToFolderItem, renameVariationItem } from '@/shared/store/services/variationService';
import { useState, useEffect } from 'react';

interface GameStore {
  initialFen: string;
  board: BoardState;
  boards: BoardState[];
  moves: string[];
  currentIndex: number;
  topics: Topic[];
  folders: Folder[];
  variations: Variation[];
  selectedTopicId: string | null;
  selectedFolderId: string | null;
  selectedVariationId: string | null;
  expandedFolderIds: string[];
  authUserId: string | null;

  // Actions
  loadVariation: (initialFen: string, moves: string[]) => void;
  loadVariationById: (variationId: string) => void;
  applyMove: (moveString: string) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  createTopic: (name: string) => string;
  renameTopic: (topicId: string, name: string) => void;
  selectTopic: (topicId: string | null) => void;
  createFolder: (name: string, parentId?: string | null, topicId?: string | null) => string | null;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  selectFolder: (folderId: string | null) => void;
  setExpandedFolderIds: (folderIds: string[]) => void;
  expandFolderPath: (folderId: string | null) => void;
  saveCurrentVariation: (name: string, folderId?: string | null) => void;
  renameVariation: (variationId: string, name: string) => void;
  deleteVariation: (variationId: string) => void;
  moveVariationToFolder: (variationId: string, folderId: string | null) => void;
  setAuthUser: (userId: string | null) => void;
  syncLibraryFromStorage: () => Promise<void>;
}

const START_FEN = 'rnbakabnr/9/1c5c1/...' as const;
const START_BOARDS = buildBoards(START_FEN, []);

const getBoardForIndex = (boards: BoardState[], index: number): BoardState =>
  boards[index + 1] ?? boards[0];

function ensureTopicExists(topics: Topic[]): Topic[] {
  if (topics.length > 0) {
    return topics;
  }

  return [createTopicItem('Topic mac dinh')];
}

function collectAncestorFolderIds(folders: Folder[], folderId: string | null): string[] {
  if (!folderId) {
    return [];
  }

  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const ids: string[] = [];
  const visited = new Set<string>();
  let current = byId.get(folderId) ?? null;

  while (current && current.parentId) {
    if (visited.has(current.id)) {
      break;
    }
    ids.push(current.parentId);
    visited.add(current.id);
    current = byId.get(current.parentId) ?? null;
  }

  return ids;
}

function normalizeSnapshot(snapshot: { topics?: Topic[]; folders: Folder[]; variations: Variation[] }): {
  topics: Topic[];
  folders: Folder[];
  variations: Variation[];
} {
  const now = new Date().toISOString();
  let topics = ensureTopicExists(snapshot.topics ?? []);

  const allFolders = snapshot.folders ?? [];
  const rootFolders = allFolders.filter((folder) => !folder.parentId);
  const hasExplicitTopics = (snapshot.topics ?? []).length > 0;

  if (!hasExplicitTopics && rootFolders.length > 0) {
    topics = rootFolders.map((folder) => ({
      id: folder.id,
      userId: folder.userId,
      name: folder.name,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));
  }

  const topicIds = new Set(topics.map((topic) => topic.id));
  const byId = new Map(allFolders.map((folder) => [folder.id, folder]));

  const sourceFolders = hasExplicitTopics ? allFolders : allFolders.filter((folder) => folder.parentId !== null);
  const sourceFolderIds = new Set(sourceFolders.map((folder) => folder.id));

  const resolveTopicIdFromFolder = (folderId: string | null): string | null => {
    if (!folderId) {
      return null;
    }

    const visited = new Set<string>();
    let current = byId.get(folderId) ?? null;

    while (current) {
      if (visited.has(current.id)) {
        return null;
      }
      visited.add(current.id);

      if (current.topicId && topicIds.has(current.topicId)) {
        return current.topicId;
      }

      if (!hasExplicitTopics && !current.parentId && topicIds.has(current.id)) {
        return current.id;
      }

      current = current.parentId ? byId.get(current.parentId) ?? null : null;
    }

    return null;
  };

  const fallbackTopicId = topics[0].id;

  const folders: Folder[] = sourceFolders.map((folder) => {
    const resolvedTopicId =
      (folder.topicId && topicIds.has(folder.topicId) ? folder.topicId : null) ??
      resolveTopicIdFromFolder(folder.parentId) ??
      fallbackTopicId;

    const nextParentId = folder.parentId && sourceFolderIds.has(folder.parentId) ? folder.parentId : null;

    return {
      ...folder,
      topicId: resolvedTopicId,
      parentId: nextParentId,
    };
  });

  const normalizedFolderIds = new Set(folders.map((folder) => folder.id));
  const folderTopicById = new Map(folders.map((folder) => [folder.id, folder.topicId]));

  const variations: Variation[] = (snapshot.variations ?? []).map((variation) => {
    const legacyTopicId = (variation as Variation & { topicId?: string }).topicId;
    const nextFolderId = variation.folderId && normalizedFolderIds.has(variation.folderId) ? variation.folderId : null;
    let resolvedTopicId: string = fallbackTopicId;

    if (legacyTopicId && topicIds.has(legacyTopicId)) {
      resolvedTopicId = legacyTopicId;
    } else if (nextFolderId) {
      const folderTopicId = folderTopicById.get(nextFolderId);
      if (folderTopicId && topicIds.has(folderTopicId)) {
        resolvedTopicId = folderTopicId;
      }
    }

    return {
      ...variation,
      topicId: resolvedTopicId,
      folderId: nextFolderId,
      createdAt: variation.createdAt ?? now,
      updatedAt: variation.updatedAt ?? now,
    };
  });

  return { topics, folders, variations };
}

const createSeedLibrary = (): Pick<GameStore, 'topics' | 'folders' | 'variations' | 'selectedTopicId' | 'selectedFolderId' | 'selectedVariationId' | 'expandedFolderIds'> => {
  const rootTopic = createTopicItem('Khai cuoc Phao Dau');
  const openingFolder = createFolderItem('Co ban', rootTopic.id, null);
  const sampleVariation = createVariationItem({
    name: 'Bien co ban',
    initialFen: START_FEN,
    moves: ['b0c2', 'h9g7'],
    topicId: rootTopic.id,
    folderId: openingFolder.id,
  });

  return {
    topics: [rootTopic],
    folders: [openingFolder],
    variations: [sampleVariation],
    selectedTopicId: rootTopic.id,
    selectedFolderId: openingFolder.id,
    selectedVariationId: sampleVariation.id,
    expandedFolderIds: [],
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createSeedLibrary(),
      initialFen: START_FEN,
      board: START_BOARDS[0],
      boards: START_BOARDS,
      moves: [],
      currentIndex: -1,
      authUserId: null,

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

      loadVariationById: (variationId) => {
        const variation = get().variations.find((item) => item.id === variationId);
        if (!variation) {
          return;
        }

        try {
          const ancestorIds = collectAncestorFolderIds(get().folders, variation.folderId);
          set({
            selectedVariationId: variationId,
            selectedTopicId: variation.topicId,
            selectedFolderId: variation.folderId,
            expandedFolderIds: Array.from(new Set([...get().expandedFolderIds, ...ancestorIds])),
          });
          get().loadVariation(variation.initialFen, variation.moves);
        } catch (error) {
          console.warn(handleMalformedReplayFailure(error));
        }
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

      createTopic: (name) => {
        const topic = createTopicItem(name, get().authUserId);
        set((state) => ({
          topics: [...state.topics, topic],
          selectedTopicId: topic.id,
          selectedFolderId: null,
        }));
        chessBookStorageService.saveTopics(get().topics).catch(console.error);
        return topic.id;
      },

      renameTopic: (topicId, name) => {
        set((state) => ({
          topics: state.topics.map((topic) => {
            if (topic.id !== topicId) {
              return topic;
            }

            return {
              ...topic,
              name: name.trim(),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        chessBookStorageService.saveTopics(get().topics).catch(console.error);
      },

      selectTopic: (topicId) => {
        set({
          selectedTopicId: topicId,
          selectedFolderId: null,
        });
      },

      createFolder: (name, parentId = null, topicId = null) => {
        const state = get();
        const parentFolder = parentId ? state.folders.find((folder) => folder.id === parentId) ?? null : null;
        const resolvedTopicId = topicId ?? parentFolder?.topicId ?? state.selectedTopicId ?? state.topics[0]?.id ?? null;

        if (!resolvedTopicId) {
          return null;
        }

        const nextFolder = createFolderItem(name, resolvedTopicId, parentId, state.authUserId);
        set((prev) => ({
          folders: [...prev.folders, nextFolder],
          selectedTopicId: resolvedTopicId,
          selectedFolderId: nextFolder.id,
          expandedFolderIds: parentId
            ? Array.from(new Set([...prev.expandedFolderIds, parentId]))
            : prev.expandedFolderIds,
        }));
        chessBookStorageService.saveFolders(get().folders).catch(console.error);
        return nextFolder.id;
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
            expandedFolderIds: state.expandedFolderIds.filter((id) => !deletedIds.has(id)),
          };
        });
        chessBookStorageService.saveFolders(get().folders).catch(console.error);
        chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },

      selectFolder: (folderId) => {
        const folder = folderId ? get().folders.find((item) => item.id === folderId) ?? null : null;
        set({
          selectedFolderId: folderId,
          selectedTopicId: folder?.topicId ?? get().selectedTopicId,
        });
      },

      setExpandedFolderIds: (folderIds) => {
        set({ expandedFolderIds: Array.from(new Set(folderIds)) });
      },

      expandFolderPath: (folderId) => {
        if (!folderId) {
          return;
        }

        const ancestorIds = collectAncestorFolderIds(get().folders, folderId);
        set((state) => ({
          expandedFolderIds: Array.from(new Set([...state.expandedFolderIds, ...ancestorIds])),
        }));
      },

      saveCurrentVariation: (name, folderId = null) => {
        set((state) => {
          const folder = folderId ? state.folders.find((item) => item.id === folderId) ?? null : null;
          const topicId = folder?.topicId ?? state.selectedTopicId ?? state.topics[0]?.id;

          if (!topicId) {
            return state;
          }

          const nextVariation = createVariationItem({
            name,
            initialFen: state.initialFen,
            moves: state.moves,
            topicId,
            folderId,
          });

          return {
            variations: [...state.variations, nextVariation],
            selectedVariationId: nextVariation.id,
            selectedTopicId: topicId,
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
        set((state) => {
          const folder = folderId ? state.folders.find((item) => item.id === folderId) ?? null : null;
          const currentVariation = state.variations.find((item) => item.id === variationId) ?? null;
          const topicId = folder?.topicId ?? currentVariation?.topicId ?? state.selectedTopicId ?? state.topics[0]?.id;

          if (!topicId) {
            return state;
          }

          return {
            variations: moveVariationToFolderItem(state.variations, variationId, folderId, topicId),
            selectedTopicId: topicId,
          };
        });
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
        const normalized = normalizeSnapshot(snapshot);

        if (
          normalized.topics.length === 0 &&
          normalized.folders.length === 0 &&
          normalized.variations.length === 0 &&
          currentState.folders.length > 0
        ) {
          await chessBookStorageService.saveTopics(currentState.topics).catch(console.error);
          await chessBookStorageService.saveFolders(currentState.folders).catch(console.error);
          await chessBookStorageService.saveVariations(currentState.variations).catch(console.error);
          return;
        }

        const nextSelectedFolderId = currentState.selectedFolderId ?? normalized.folders[0]?.id ?? null;
        const nextSelectedVariationId = currentState.selectedVariationId ?? normalized.variations[0]?.id ?? null;
        const selectedVariation = normalized.variations.find((variation) => variation.id === nextSelectedVariationId) ?? null;
        const selectedFolder = nextSelectedFolderId
          ? normalized.folders.find((folder) => folder.id === nextSelectedFolderId) ?? null
          : null;
        const nextSelectedTopicId =
          selectedVariation?.topicId ??
          selectedFolder?.topicId ??
          currentState.selectedTopicId ??
          normalized.topics[0]?.id ??
          null;
        let selectedBoards: BoardState[] | null = null;

        if (selectedVariation) {
          try {
            selectedBoards = buildBoards(selectedVariation.initialFen, selectedVariation.moves);
          } catch (error) {
            console.warn(handleMalformedReplayFailure(error));
            selectedBoards = null;
          }
        }

        set((state) => ({
          topics: normalized.topics,
          folders: normalized.folders,
          variations: normalized.variations,
          selectedTopicId: nextSelectedTopicId,
          selectedFolderId: nextSelectedFolderId,
          selectedVariationId: nextSelectedVariationId,
          initialFen: selectedVariation?.initialFen ?? state.initialFen,
          moves: selectedVariation ? [...selectedVariation.moves] : state.moves,
          currentIndex: selectedVariation ? selectedVariation.moves.length - 1 : state.currentIndex,
          boards: selectedBoards ?? state.boards,
          board: selectedVariation
            ? getBoardForIndex(selectedBoards ?? state.boards, selectedVariation.moves.length - 1)
            : state.board,
        }));

        await chessBookStorageService.saveTopics(get().topics).catch(console.error);
        await chessBookStorageService.saveFolders(get().folders).catch(console.error);
        await chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },
    }),
    {
      name: 'xiangqi-storage',
      partialize: (state) => ({
        initialFen: state.initialFen,
        moves: state.moves,
        currentIndex: state.currentIndex,
        topics: state.topics,
        folders: state.folders,
        variations: state.variations,
        selectedTopicId: state.selectedTopicId,
        selectedFolderId: state.selectedFolderId,
        selectedVariationId: state.selectedVariationId,
        authUserId: state.authUserId,
      }),
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

