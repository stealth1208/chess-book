'use client';

import { useTopicStore } from '@/shared/store/useTopicStore';

export function useFolderTreeActions() {
  const {
    topics,
    folders,
    variations,
    selectedTopicId,
    selectedFolderId,
    selectedVariationId,
    createTopic,
    createFolder,
    renameTopic,
    deleteTopic,
    renameFolder,
    deleteFolder,
    selectTopic,
    selectFolder,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    selectVariationById,
    moveVariationToFolder,
  } = useTopicStore();

  const promptFolderName = (defaultValue = ''): string | null => {
    const input = window.prompt('Ten thu muc', defaultValue);
    if (input === null) return null;
    const name = input.trim();
    return name || null;
  };

  const tryDeleteFolder = (folderId: string): void => {
    const confirmed = window.confirm('Are you sure you want to delete this folder?');
    if (!confirmed) {
      return;
    }

    const hasChildFolder = folders.some((folder) => folder.parentId === folderId);
    const hasVariations = variations.some((variation) => variation.folderId === folderId);

    if (hasChildFolder || hasVariations) {
      window.alert('Khong the xoa thu muc chua du lieu. Vui long xoa hoac di chuyen noi dung truoc.');
      return;
    }

    deleteFolder(folderId);
  };

  return {
    topics,
    folders,
    variations,
    selectedTopicId,
    selectedFolderId,
    selectedVariationId,
    createTopic,
    createFolder,
    renameTopic,
    deleteTopic,
    renameFolder,
    deleteFolder,
    tryDeleteFolder,
    selectTopic,
    selectFolder,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    selectVariationById,
    moveVariationToFolder,
    promptFolderName,
  };
}