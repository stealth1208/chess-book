'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeMoves } from '@/features/engine/notation/moveRecord';
import type { Move, StoredMove } from '@/features/engine/notation/notation.types';
import { chessBookStorageService } from '@/infrastructure/storage/chessBookStorageService';
import type { Folder, Topic, Variation } from '@/shared/chessBook/types/chessBook';
import { handleMalformedReplayFailure } from '@/shared/chessBook/errors/chessBookErrors';
import { createFolderItem, createTopicItem, deleteFolderItem, renameFolderItem } from '@/shared/store/services/folderService';
import { createVariationItem, deleteVariationItem, deleteVariationsByFolderIds, moveVariationToFolderItem, renameVariationItem } from '@/shared/store/services/variationService';

interface TopicStore {
  topics: Topic[];
  folders: Folder[];
  variations: Variation[];
  selectedTopicId: string | null;
  selectedFolderId: string | null;
  selectedVariationId: string | null;
  expandedFolderIds: string[];
  authUserId: string | null;
  editVariationId: string | null;

  // Actions
  createTopic: (name: string) => string;
  renameTopic: (topicId: string, name: string) => void;
  deleteTopic: (topicId: string) => void;
  selectTopic: (topicId: string | null) => void;
  createFolder: (name: string, parentId?: string | null, topicId?: string | null) => string | null;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  selectFolder: (folderId: string | null) => void;
  saveVariation: (name: string, initialFen: string, moves: Move[], folderId?: string | null) => void;
  renameVariation: (variationId: string, name: string) => void;
  deleteVariation: (variationId: string) => void;
  moveVariationToFolder: (variationId: string, folderId: string | null) => void;
  selectVariationById: (variationId: string) => void;
  clearSelectionState: () => void;
  setEditVariationId: (id: string | null) => void;
  setAuthUser: (userId: string | null) => void;
  syncLibraryFromStorage: () => Promise<void>;
  setExpandedFolderIds: (folderIds: string[]) => void;
  expandFolderPath: (folderId: string) => void;
}

function ensureTopicExists(topics: Topic[]): Topic[] {
  if (topics.length > 0) {
    return topics;
  }

  return [createTopicItem('Topic mac dinh')];
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

    const rawMoves = ((variation as Variation & { moves?: StoredMove[] }).moves ?? []) as StoredMove[];

    return {
      ...variation,
      moves: normalizeMoves(variation.initialFen, rawMoves),
      topicId: resolvedTopicId,
      folderId: nextFolderId,
      createdAt: variation.createdAt ?? now,
      updatedAt: variation.updatedAt ?? now,
    };
  });

  return { topics, folders, variations };
}

const createSeedLibrary = (): Pick<TopicStore, 'topics' | 'folders' | 'variations' | 'selectedTopicId' | 'selectedFolderId' | 'selectedVariationId' | 'expandedFolderIds'> => {
  const rootTopic = createTopicItem('Khai cuoc Phao Dau');
  const openingFolder = createFolderItem('Co ban', rootTopic.id, null);
  const startFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';
  const sampleVariation = createVariationItem({
    name: 'Bien co ban',
    initialFen: startFen,
    moves: normalizeMoves(startFen, ['b7b4', 'h2h5']),
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

export const useTopicStore = create<TopicStore>()(
  persist(
    (set, get) => ({
      ...createSeedLibrary(),
      authUserId: null,
      editVariationId: null,

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

      deleteTopic: (topicId) => {
        set((state) => {
          const hasFolderInTopic = state.folders.some((folder) => folder.topicId === topicId);
          const hasVariationInTopic = state.variations.some((variation) => variation.topicId === topicId);

          if (hasFolderInTopic || hasVariationInTopic) {
            console.warn('Cannot delete non-empty topic.');
            return state;
          }

          const nextTopics = state.topics.filter((topic) => topic.id !== topicId);
          const nextSelectedTopicId = state.selectedTopicId === topicId
            ? nextTopics[0]?.id ?? null
            : state.selectedTopicId;

          return {
            topics: nextTopics,
            selectedTopicId: nextSelectedTopicId,
          };
        });
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

      saveVariation: (name, initialFen, moves, folderId = null) => {
        set((state) => {
          const folder = folderId ? state.folders.find((item) => item.id === folderId) ?? null : null;
          const topicId = folder?.topicId ?? state.selectedTopicId ?? state.topics[0]?.id;

          if (!topicId) {
            return state;
          }

          const nextVariation = createVariationItem({
            name,
            initialFen,
            moves,
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

      selectVariationById: (variationId) => {
        const variation = get().variations.find((item) => item.id === variationId);
        if (!variation) {
          return;
        }

        try {
          set({
            selectedVariationId: variationId,          
          });
        } catch (error) {
          console.warn(handleMalformedReplayFailure(error));
        }
      },

      clearSelectionState: () => {
        set({
          selectedTopicId: null,
          selectedFolderId: null,
          selectedVariationId: null,
        });
      },

      setEditVariationId: (id) => {
        set({ editVariationId: id });
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

      setExpandedFolderIds: (folderIds) => {
        set({ expandedFolderIds: folderIds });
      },

      expandFolderPath: (folderId) => {
        const state = get();
        const path: string[] = [];
        let currentId: string | null = folderId;

        while (currentId) {
          const folder = state.folders.find((f) => f.id === currentId);
          if (!folder) break;
          path.push(currentId);
          currentId = folder.parentId;
        }

        const expanded = new Set([...state.expandedFolderIds, ...path]);
        set({ expandedFolderIds: Array.from(expanded) });
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

        const nextSelectedFolderId = normalized.folders.some((folder) => folder.id === currentState.selectedFolderId)
          ? currentState.selectedFolderId
          : null;
        const nextSelectedVariationId = normalized.variations.some((variation) => variation.id === currentState.selectedVariationId)
          ? currentState.selectedVariationId
          : null;
        const selectedVariation = nextSelectedVariationId
          ? normalized.variations.find((variation) => variation.id === nextSelectedVariationId) ?? null
          : null;
        const selectedFolder = nextSelectedFolderId
          ? normalized.folders.find((folder) => folder.id === nextSelectedFolderId) ?? null
          : null;
        const hasCurrentSelectedTopic = normalized.topics.some((topic) => topic.id === currentState.selectedTopicId);
        const nextSelectedTopicId = selectedVariation?.topicId
          ?? selectedFolder?.topicId
          ?? (hasCurrentSelectedTopic ? currentState.selectedTopicId : null)
          ?? null;

        set({
          topics: normalized.topics,
          folders: normalized.folders,
          variations: normalized.variations,
          selectedTopicId: nextSelectedTopicId,
          selectedFolderId: nextSelectedFolderId,
          selectedVariationId: nextSelectedVariationId,
        });

        await chessBookStorageService.saveTopics(get().topics).catch(console.error);
        await chessBookStorageService.saveFolders(get().folders).catch(console.error);
        await chessBookStorageService.saveVariations(get().variations).catch(console.error);
      },
    }),
    {
      name: 'xiangqi-topic-storage',
      partialize: (state) => ({
        topics: state.topics,
        folders: state.folders,
        variations: state.variations,
        authUserId: state.authUserId,
      }),
    }
  )
);

