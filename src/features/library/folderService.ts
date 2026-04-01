import type { Folder } from "@/features/types/study";
import { validateFolder } from "@/features/validation/studyValidators";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createFolderItem(name: string, parentId: string | null, userId: string | null = null): Folder {
  const ts = nowIso();
  const folder: Folder = {
    id: newId(),
    userId,
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
