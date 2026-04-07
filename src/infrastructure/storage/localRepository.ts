import localforage from "localforage";
import { STORAGE_KEYS } from "@/infrastructure/storage/keys";
import type { ChessBookSnapshot, Folder, Topic, Variation } from "@/shared/chessBook/types/chessBook";

async function read<T>(key: string): Promise<T[]> {
  return (await localforage.getItem<T[]>(key)) ?? [];
}

async function write<T>(key: string, value: T[]): Promise<void> {
  await localforage.setItem(key, value);
}

export const localRepository = {
  async listTopics(): Promise<Topic[]> {
    return read<Topic>(STORAGE_KEYS.topics);
  },

  async listFolders(): Promise<Folder[]> {
    return read<Folder>(STORAGE_KEYS.folders);
  },

  async listVariations(): Promise<Variation[]> {
    return read<Variation>(STORAGE_KEYS.variations);
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    await write<Folder>(STORAGE_KEYS.folders, folders);
  },

  async saveTopics(topics: Topic[]): Promise<void> {
    await write<Topic>(STORAGE_KEYS.topics, topics);
  },

  async saveVariations(variations: Variation[]): Promise<void> {
    await write<Variation>(STORAGE_KEYS.variations, variations);
  },

  async loadSnapshot(): Promise<ChessBookSnapshot> {
    const [topics, folders, variations] = await Promise.all([
      this.listTopics(),
      this.listFolders(),
      this.listVariations(),
    ]);

    return { topics, folders, variations };
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      localforage.removeItem(STORAGE_KEYS.topics),
      localforage.removeItem(STORAGE_KEYS.folders),
      localforage.removeItem(STORAGE_KEYS.variations),
    ]);
  },
};
