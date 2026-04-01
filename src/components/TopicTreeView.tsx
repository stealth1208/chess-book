import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function TopicTreeView() {
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
  } = useGameStore();

  const rootFolders = useMemo(
    () => folders.filter((folder) => folder.parentId === null),
    [folders]
  );

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

  const promptFolderName = (defaultValue = ''): string | null => {
    const input = window.prompt('Ten thu muc', defaultValue);
    if (input === null) {
      return null;
    }

    const name = input.trim();
    return name ? name : null;
  };

  const renderFolder = (folderId: string | null, depth = 0): JSX.Element[] => {
    const list = childFolders.get(folderId) ?? [];

    return list.map((folder) => {
      const folderVariations = variationsByFolder.get(folder.id) ?? [];
      const nested = renderFolder(folder.id, depth + 1);

      return (
        <div key={folder.id} className="space-y-1">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
              selectedFolderId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface'
            }`}
            style={{ marginLeft: depth * 12 }}
          >
            <button className="flex flex-1 items-center gap-2 text-left" onClick={() => selectFolder(folder.id)}>
              <span className="material-symbols-outlined text-base">folder</span>
              <span className="text-sm font-medium">{folder.name}</span>
            </button>
            <button
              className="text-xs text-outline hover:text-primary"
              onClick={() => {
                const nextName = promptFolderName(folder.name);
                if (nextName) renameFolder(folder.id, nextName);
              }}
            >
              Sua
            </button>
            <button className="text-xs text-outline hover:text-error" onClick={() => deleteFolder(folder.id)}>
              Xoa
            </button>
          </div>

          {folderVariations.map((variation) => (
            <button
              key={variation.id}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                selectedVariationId === variation.id
                  ? 'bg-tertiary/15 text-tertiary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              style={{ marginLeft: (depth + 1) * 18 }}
              onClick={() => loadVariationById(variation.id)}
            >
              {variation.name}
            </button>
          ))}

          {nested}
        </div>
      );
    });
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {rootFolders.length === 0 ? (
          <p className="px-2 py-4 text-sm text-on-surface-variant">Chua co thu muc.</p>
        ) : (
          renderFolder(null)
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
