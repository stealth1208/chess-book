'use client';

import { ActionIcon, Badge, Group, Text, Tree, getTreeExpandedState, type TreeNodeData, useTree } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFolderTreeActions } from '@/features/library/hooks/useFolderTreeActions';

interface TopicViewProps {
  onEditVariation?: (variationId: string) => void;
}

export function TopicView({ onEditVariation }: TopicViewProps) {
  const {
    folders,
    variations,
    selectedFolderId,
    selectedVariationId,
    createFolder,
    renameFolder,
    tryDeleteFolder,
    selectFolder,
    loadVariationById,
    promptFolderName,
  } = useFolderTreeActions();

  const childFolders = useMemo(() => {
    const map = new Map<string | null, typeof folders>();

    for (const folder of folders) {
      const key = folder.parentId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(folder);
    }

    return map;
  }, [folders]);

  const variationsByFolder = useMemo(() => {
    const map = new Map<string | null, typeof variations>();

    for (const variation of variations) {
      const key = variation.folderId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(variation);
    }

    return map;
  }, [variations]);

  const buildTree = useCallback((folderId: string | null, depth = 0, visited: Set<string> = new Set()): TreeNodeData[] => {
    const list = childFolders.get(folderId) ?? [];

    return list.flatMap((folder) => {
      if (visited.has(folder.id) || depth > 20) {
        return [];
      }

      const folderVariations = variationsByFolder.get(folder.id) ?? [];
      const nextVisited = new Set(visited);
      nextVisited.add(folder.id);
      const nestedFolders = buildTree(folder.id, depth + 1, nextVisited);

      return [
        {
          value: `folder:${folder.id}`,
          label: folder.name,
          children: [
            ...nestedFolders,
            ...folderVariations.map((variation) => ({
              value: `variation:${variation.id}`,
              label: variation.name,
            })),
          ],
        },
      ];
    });
  }, [childFolders, variationsByFolder]);

  const treeData = useMemo<TreeNodeData[]>(() => {
    const data = buildTree(null);
    const rootVariations = variationsByFolder.get(null) ?? [];

    if (rootVariations.length > 0) {
      data.push({
        value: 'folder:__unassigned__',
        label: 'Khong thu muc',
        children: rootVariations.map((variation) => ({
          value: `variation:${variation.id}`,
          label: variation.name,
        })),
      });
    }

    return data;
  }, [buildTree, variationsByFolder]);

  const tree = useTree();
  const didInitExpand = useRef(false);

  useEffect(() => {
    if (didInitExpand.current || treeData.length === 0) {
      return;
    }

    tree.setExpandedState(getTreeExpandedState(treeData, '*'));
    didInitExpand.current = true;
  }, [tree, treeData]);

  const onNodeClick = (value: string) => {
    if (value.startsWith('folder:')) {
      const folderId = value.slice('folder:'.length);
      selectFolder(folderId === '__unassigned__' ? null : folderId);
      return;
    }

    if (value.startsWith('variation:')) {
      loadVariationById(value.slice('variation:'.length));
    }
  };
console.log('treeData', treeData);

  return (
    <section className="flex h-full flex-col overflow-hidden bg-surface-container-low">
      <div className="shrink-0 border-b border-outline-variant/10 p-5">
        <h2 className="font-headline text-xl font-bold text-on-surface">Lộ trình khai cuộc</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Thư mục và biến được đồng bộ từ bộ nhớ cục bộ.</p>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
            onClick={() => {
              const name = promptFolderName();
              if (name) {
                createFolder(name, selectedFolderId ?? null);
              }
            }}
          >
            + Thu muc
          </button>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto p-4">
        {treeData.length === 0 ? (
          <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc hoac bien nao.</p>
        ) : (
          <Tree
            data={treeData}
            tree={tree}
            levelOffset="md"
            renderNode={({ node, elementProps, hasChildren }) => {
              const value = String(node.value);
              const isFolder = value.startsWith('folder:');
              const folderId = isFolder ? value.slice('folder:'.length) : null;
              const variationId = value.startsWith('variation:') ? value.slice('variation:'.length) : null;
              const isSelectedFolder = isFolder && ((folderId === '__unassigned__' && selectedFolderId === null) || selectedFolderId === folderId);
              const isSelectedVariation = Boolean(variationId) && selectedVariationId === variationId;

              return (
                <div
                  {...elementProps}
                  onClick={(event) => {
                    elementProps.onClick(event);
                    onNodeClick(value);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                    isSelectedFolder
                      ? 'bg-primary/10 text-primary'
                      : isSelectedVariation
                        ? 'bg-tertiary/15 text-tertiary'
                        : 'text-on-surface hover:bg-surface-container-high'
                  } ${elementProps.className}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isFolder ? (hasChildren ? 'folder_open' : 'folder') : 'book_2'}
                  </span>

                  <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" truncate>
                      {node.label}
                    </Text>
                    {!isFolder && (
                      <Badge size="xs" variant="light" color="teal">
                        Line
                      </Badge>
                    )}
                  </Group>

                  {isFolder && folderId !== '__unassigned__' && (
                    <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          const nextName = promptFolderName(String(node.label));
                          if (nextName && folderId) {
                            renameFolder(folderId, nextName);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => {
                          if (folderId) {
                            tryDeleteFolder(folderId);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </ActionIcon>
                    </Group>
                  )}

                  {!isFolder && variationId && onEditVariation && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditVariation(variationId);
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </ActionIcon>
                  )}
                </div>
              );
            }}
          />
        )}
      </nav>
    </section>
  );
}