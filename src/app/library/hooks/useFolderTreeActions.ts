'use client';

import { useGameStore } from '@/store/useGameStore';

export function useFolderTreeActions() {
  const {
    folders,
    variations,
    selectedFolderId,
    selectedVariationId,
    createFolder,
    renameFolder,
    deleteFolder,
    selectFolder,
    loadVariationById,
    moveVariationToFolder,
  } = useGameStore();

  const promptFolderName = (defaultValue = ''): string | null => {
    const input = window.prompt('Ten thu muc', defaultValue);
    if (input === null) return null;
    const name = input.trim();
    return name || null;
  };

  const tryDeleteFolder = (folderId: string): void => {
    const hasChildFolder = folders.some((folder) => folder.parentId === folderId);
    const hasVariations = variations.some((variation) => variation.folderId === folderId);

    if (hasChildFolder || hasVariations) {
      window.alert('Khong the xoa thu muc chua du lieu. Vui long xoa hoac di chuyen noi dung truoc.');
      return;
    }

    deleteFolder(folderId);
  };

  return {
    folders,
    variations,
    selectedFolderId,
    selectedVariationId,
    createFolder,
    renameFolder,
    tryDeleteFolder,
    selectFolder,
    loadVariationById,
    moveVariationToFolder,
    promptFolderName,
  };
}