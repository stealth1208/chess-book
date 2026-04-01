import localforage from "localforage";
import { STORAGE_KEYS } from "@/features/storage/keys";
import type { Folder, StudySnapshot, Variation } from "@/features/types/study";

async function read<T>(key: string): Promise<T[]> {
  return (await localforage.getItem<T[]>(key)) ?? [];
}

async function write<T>(key: string, value: T[]): Promise<void> {
  await localforage.setItem(key, value);
}

export const localRepository = {
  async listFolders(): Promise<Folder[]> {
    return read<Folder>(STORAGE_KEYS.folders);
  },

  async listVariations(): Promise<Variation[]> {
    return read<Variation>(STORAGE_KEYS.variations);
  },

  async saveFolders(folders: Folder[]): Promise<void> {
    await write<Folder>(STORAGE_KEYS.folders, folders);
  },

  async saveVariations(variations: Variation[]): Promise<void> {
    await write<Variation>(STORAGE_KEYS.variations, variations);
  },

  async loadSnapshot(): Promise<StudySnapshot> {
    const [folders, variations] = await Promise.all([
      this.listFolders(),
      this.listVariations(),
    ]);

    return { folders, variations };
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      localforage.removeItem(STORAGE_KEYS.folders),
      localforage.removeItem(STORAGE_KEYS.variations),
    ]);
  },
};
