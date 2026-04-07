import { Text, Tree, getTreeExpandedState, type TreeNodeData, useTree } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/shared/store/useGameStore';

interface NewVariationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialDescription?: string;
  initialFolderId?: string | null;
  initialMoves?: string[];
  onSubmit?: (payload: { name: string; description: string; folderId: string | null }) => void;
  onDelete?: () => void;
}

export function NewVariationModal({
  isOpen = false,
  onClose,
  mode = 'create',
  initialName = '',
  initialDescription = '',
  initialFolderId,
  initialMoves = [],
  onSubmit,
  onDelete,
}: NewVariationModalProps) {
  const {
    topics,
    folders,
    selectedTopicId,
    selectedFolderId,
    expandedFolderIds,
    setExpandedFolderIds,
    expandFolderPath,
    createFolder,
    renameFolder,
    saveCurrentVariation,
  } = useGameStore();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId ?? selectedFolderId ?? null);
  const tree = useTree();
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const currentTopicId = useMemo(() => {
    if (folderId) {
      const folder = folders.find((item) => item.id === folderId) ?? null;
      if (folder) {
        return folder.topicId;
      }
    }

    return selectedTopicId ?? topics[0]?.id ?? null;
  }, [folderId, folders, selectedTopicId, topics]);

  const folderTree = useMemo(() => {
    if (!currentTopicId) {
      return [];
    }

    const inTopic = folders.filter((folder) => folder.topicId === currentTopicId);
    const byParent = new Map<string | null, typeof inTopic>();

    for (const folder of inTopic) {
      const key = folder.parentId;
      if (!byParent.has(key)) {
        byParent.set(key, []);
      }
      byParent.get(key)!.push(folder);
    }

    const buildTree = (parentId: string | null): TreeNodeData[] => {
      const childFolders = byParent.get(parentId) ?? [];

      return childFolders.map((folder) => ({
        value: `folder:${folder.id}`,
        label: folder.name,
        children: buildTree(folder.id),
      }));
    };

    return buildTree(null);
  }, [currentTopicId, folders]);

  const expandedState = useMemo(() => {
    const state = getTreeExpandedState(folderTree, '*') as Record<string, boolean>;
    for (const key of Object.keys(state)) {
      if (key.startsWith('folder:')) {
        const id = key.slice('folder:'.length);
        state[key] = expandedFolderIds.includes(id);
      }
    }
    return state;
  }, [expandedFolderIds, folderTree]);

  useEffect(() => {
    if (!initialFolderId) {
      return;
    }

    expandFolderPath(initialFolderId);
  }, [expandFolderPath, initialFolderId]);

  useEffect(() => {
    tree.setExpandedState(expandedState);
  }, [expandedState, tree]);

  useEffect(() => {
    if (!folderId) {
      return;
    }

    const node = nodeRefs.current.get(`folder:${folderId}`);
    if (node) {
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [folderId, folderTree]);

  if (!isOpen) return null;

  const createFolderInModal = () => {
    if (!currentTopicId) {
      return;
    }

    const newFolderId = createFolder('Thu muc moi', folderId, currentTopicId);
    if (!newFolderId) {
      return;
    }

    const nextName = window.prompt('Ten thu muc', 'Thu muc moi');
    if (nextName && nextName.trim()) {
      renameFolder(newFolderId, nextName.trim());
    }

    if (folderId) {
      setExpandedFolderIds(Array.from(new Set([...expandedFolderIds, folderId])));
    }
    setFolderId(newFolderId);
    expandFolderPath(newFolderId);
  };

  const syncExpandedIdsFromTree = () => {
    const next = Object.entries(tree.expandedState)
      .filter(([value, isExpanded]) => isExpanded && value.startsWith('folder:'))
      .map(([value]) => value.slice('folder:'.length));
    setExpandedFolderIds(next);
  };

  const save = () => {
    const finalName = name.trim() || `Bien moi ${new Date().toLocaleTimeString()}`;
    if (onSubmit) {
      onSubmit({ name: finalName, description, folderId });
    } else {
      saveCurrentVariation(finalName, folderId);
    }
    setName('');
    setDescription('');
    onClose?.();
  };
  
  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 bg-primary text-on-primary flex justify-between items-center">
          <h2 className="text-xl font-headline font-extrabold tracking-tight">{mode === 'edit' ? 'Cập nhật biến đi' : 'Lưu biến đi mới'}</h2>
          <button className="material-symbols-outlined hover:bg-black/10 rounded-full p-1 transition-colors" onClick={onClose}>close</button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant ml-1">Tên biến đi</label>
            <input
              className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Binh Phong Ma - Bien 4"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant ml-1">Mô tả biến đi</label>
            <textarea
              className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm ghi chú hoặc mô tả chi tiết cho biến đi này..."
            />
          </div>
          {initialMoves.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant ml-1">Ký pháp hiện tại</label>
              <div className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-on-surface text-sm overflow-auto max-h-24">
                <code className="font-mono whitespace-pre-wrap break-words">{initialMoves.join(' ')}</code>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-on-surface-variant">Thư mục lưu trữ</label>
              <button
                type="button"
                className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                onClick={createFolderInModal}
              >
                + Thu muc
              </button>
            </div>
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-2">

              {folderTree.length === 0 ? (
                <Text size="sm" c="dimmed" px="sm" py="xs">
                  Chua co thu muc nao.
                </Text>
              ) : (
                <Tree
                  data={folderTree}
                  tree={tree}
                  levelOffset="md"
                  renderNode={({ node, elementProps, hasChildren }) => {
                    const value = String(node.value);
                    const currentFolderId = value.startsWith('folder:') ? value.slice('folder:'.length) : null;
                    const isSelected = currentFolderId === folderId;

                    return (
                      <div
                        {...elementProps}
                        ref={(element) => {
                          if (element) {
                            nodeRefs.current.set(value, element);
                          } else {
                            nodeRefs.current.delete(value);
                          }
                        }}
                        onClick={(event) => {
                          elementProps.onClick(event);
                          if (currentFolderId) {
                            expandFolderPath(currentFolderId);
                            setFolderId(currentFolderId);
                          }
                        }}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                          isSelected ? 'bg-white text-primary shadow-sm' : 'text-on-surface hover:bg-white/80'
                        } ${elementProps.className}`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {hasChildren ? 'folder_open' : 'folder'}
                        </span>
                        <span className={`truncate text-sm ${isSelected ? 'font-bold' : ''}`}>{node.label}</span>
                      </div>
                    );
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-surface-container-low flex justify-between gap-4 border-t border-outline-variant/10">
          <div>
            {mode === 'edit' && onDelete && (
              <button className="px-6 py-2.5 text-sm font-bold text-error hover:bg-error/10 rounded-xl transition-all" onClick={onDelete}>Xóa biến</button>
            )}
          </div>
          <div className="flex gap-4">
          <button className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all" onClick={onClose}>Hủy bỏ</button>
          <button className="px-8 py-2.5 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-lg hover:bg-primary-container transition-all" onClick={save}>{mode === 'edit' ? 'Lưu thay đổi' : 'Lưu biến đi'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
