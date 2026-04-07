import localforage from 'localforage';
import type { ChessBookSnapshot, Folder, Topic, Variation } from '@/shared/chessBook/types/chessBook';

export interface RemoteRepository {
  listTopics(userId: string): Promise<Topic[]>;
  listFolders(userId: string): Promise<Folder[]>;
  listVariations(userId: string): Promise<Variation[]>;
  upsertTopics(userId: string, topics: Topic[]): Promise<void>;
  upsertFolders(userId: string, folders: Folder[]): Promise<void>;
  upsertVariations(userId: string, variations: Variation[]): Promise<void>;
}

function keyFor(userId: string, entity: 'topics' | 'folders' | 'variations'): string {
  return `xiangqi.remote.${userId}.${entity}`;
}

async function readRemote<T>(key: string): Promise<T[]> {
  return (await localforage.getItem<T[]>(key)) ?? [];
}

async function writeRemote<T>(key: string, value: T[]): Promise<void> {
  await localforage.setItem(key, value);
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of current) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
}

export const remoteRepository: RemoteRepository = {
  async listTopics(userId: string): Promise<Topic[]> {
    return readRemote<Topic>(keyFor(userId, 'topics'));
  },

  async listFolders(userId: string): Promise<Folder[]> {
    return readRemote<Folder>(keyFor(userId, 'folders'));
  },

  async listVariations(userId: string): Promise<Variation[]> {
    return readRemote<Variation>(keyFor(userId, 'variations'));
  },

  async upsertTopics(userId: string, topics: Topic[]): Promise<void> {
    const key = keyFor(userId, 'topics');
    const current = await readRemote<Topic>(key);
    await writeRemote(key, mergeById(current, topics.map((topic) => ({ ...topic, userId }))));
  },

  async upsertFolders(userId: string, folders: Folder[]): Promise<void> {
    const key = keyFor(userId, 'folders');
    const current = await readRemote<Folder>(key);
    await writeRemote(key, mergeById(current, folders.map((folder) => ({ ...folder, userId }))));
  },

  async upsertVariations(userId: string, variations: Variation[]): Promise<void> {
    const key = keyFor(userId, 'variations');
    const current = await readRemote<Variation>(key);
    await writeRemote(key, mergeById(current, variations.map((variation) => ({ ...variation, userId }))));
  },
};

export async function loadRemoteSnapshot(userId: string): Promise<ChessBookSnapshot> {
  const [topics, folders, variations] = await Promise.all([
    remoteRepository.listTopics(userId),
    remoteRepository.listFolders(userId),
    remoteRepository.listVariations(userId),
  ]);

  return { topics, folders, variations };
}
