import { ActionIcon, Badge, Group, Text, Tree, TreeNodeData } from '@mantine/core';
import { useMemo } from 'react';
import { useFolderTreeActions } from '@/features/library/hooks/useFolderTreeActions';

export function TopicTreeView() {
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

  const buildTree = (folderId: string | null, depth = 0, visited: Set<string> = new Set()): TreeNodeData[] => {
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
  };

  const treeData = useMemo<TreeNodeData[]>(() => {
    const data = buildTree(null);
    const unassignedVariations = variationsByFolder.get(null) ?? [];

    if (unassignedVariations.length > 0) {
      data.push({
        value: 'folder:__unassigned__',
        label: 'Khong thu muc',
        children: unassignedVariations.map((variation) => ({
          value: `variation:${variation.id}`,
          label: variation.name,
        })),
      });
    }

    return data;
  }, [folders, variations, childFolders, variationsByFolder]);

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

  return (
    <>
      <div className="p-6 border-b border-outline-variant/10 shrink-0">
        <h2 className="font-headline font-bold text-xl text-on-surface mb-1">Lộ trình khai cuộc</h2>
        <p className="text-sm text-on-surface-variant">Pháo Đầu đối Bình Phong Mã</p>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-on-primary"
            onClick={() => {
              const name = promptFolderName();
              if (name) createFolder(name, selectedFolderId ?? null);
            }}
          >
            + Thu muc
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {treeData.length === 0 ? (
          <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc.</p>
        ) : (
          <Tree
            data={treeData}
            levelOffset="md"
            renderNode={({ node, elementProps, hasChildren }) => {
              const value = String(node.value);
              const isFolder = value.startsWith('folder:');
              const folderId = isFolder ? value.slice('folder:'.length) : null;
              const isSelectedFolder = isFolder && ((folderId === '__unassigned__' && selectedFolderId === null) || selectedFolderId === folderId);
              const isSelectedVariation = value.startsWith('variation:') && selectedVariationId === value.slice('variation:'.length);

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
                        : 'hover:bg-surface-container-high text-on-surface'
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
                      <Badge size="xs" variant="light" color="teal">Line</Badge>
                    )}
                  </Group>

                  {isFolder && folderId !== '__unassigned__' && (
                    <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          const nextName = promptFolderName(String(node.label));
                          if (nextName && folderId) renameFolder(folderId, nextName);
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => {
                          if (folderId) tryDeleteFolder(folderId);
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </ActionIcon>
                    </Group>
                  )}
                </div>
              );
            }}
          />
        )}
      </nav>
      <div className="p-4 mt-auto shrink-0">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            </div>
            <span className="text-xs font-bold text-on-surface">Gợi ý từ AI</span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">Nghiên cứu biến &quot;M2.3&quot; để đối phó với thế trận này hiệu quả hơn.</p>
        </div>
      </div>
    </>
  );
}
