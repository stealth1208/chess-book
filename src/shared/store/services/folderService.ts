import type { Folder, Topic } from "@/shared/chessBook/types/chessBook";
import { validateFolder, validateTopic } from "@/shared/chessBook/validation/chessBookValidators";

function nowIso(): string {
  return new Date().toISOString();
}

// Deterministic ID generator for seed data to avoid SSR/client hydration mismatches
export function deterministicSeedId(seed: string): string {
  // Simple hash to generate consistent IDs
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `seed-${hex}-${seed.slice(0, 8)}`;
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTopicItem(name: string, userId: string | null = null, deterministicId?: string): Topic {
  const ts = nowIso();
  const topic: Topic = {
    id: deterministicId ?? newId(),
    userId,
    name: name.trim(),
    createdAt: ts,
    updatedAt: ts,
  };

  const result = validateTopic(topic);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return topic;
}

export function createFolderItem(
  name: string,
  topicId: string,
  parentId: string | null,
  userId: string | null = null,
  deterministicId?: string
): Folder {
  const ts = nowIso();
  const folder: Folder = {
    id: deterministicId ?? newId(),
    userId,
    topicId,
    name: name.trim(),
    parentId,
    createdAt: ts,
    updatedAt: ts,
  };

  const result = validateFolder(folder);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return folder;
}

export function renameFolderItem(folders: Folder[], folderId: string, nextName: string): Folder[] {
  return folders.map((folder) => {
    if (folder.id !== folderId) {
      return folder;
    }

    const nextFolder: Folder = {
      ...folder,
      name: nextName.trim(),
      updatedAt: nowIso(),
    };

    const result = validateFolder(nextFolder);
    if (!result.ok) {
      throw new Error(result.message);
    }

    return nextFolder;
  });
}

export function deleteFolderItem(folders: Folder[], folderId: string): { nextFolders: Folder[]; deletedIds: Set<string> } {
  const deletedIds = new Set<string>([folderId]);

  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of folders) {
      if (folder.parentId && deletedIds.has(folder.parentId) && !deletedIds.has(folder.id)) {
        deletedIds.add(folder.id);
        changed = true;
      }
    }
  }

  return {
    nextFolders: folders.filter((folder) => !deletedIds.has(folder.id)),
    deletedIds,
  };
}
