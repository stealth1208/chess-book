import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';

interface NewVariationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function NewVariationModal({ isOpen = false, onClose }: NewVariationModalProps) {
  const { folders, selectedFolderId, saveCurrentVariation } = useGameStore();
  const [name, setName] = useState('');
  const [folderId, setFolderId] = useState<string | null>(selectedFolderId);

  if (!isOpen) return null;

  const save = () => {
    const finalName = name.trim() || `Bien moi ${new Date().toLocaleTimeString()}`;
    saveCurrentVariation(finalName, folderId);
    setName('');
    onClose?.();
  };
  
  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-primary text-on-primary flex justify-between items-center">
          <h2 className="text-xl font-headline font-extrabold tracking-tight">Lưu biến đi mới</h2>
          <button className="material-symbols-outlined hover:bg-black/10 rounded-full p-1 transition-colors" onClick={onClose}>close</button>
        </div>
        {/* Content */}
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
            <label className="block text-sm font-bold text-on-surface-variant ml-1">Mô tả</label>
            <textarea className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface resize-none" rows={3} defaultValue="Biến thể phòng ngự tích cực, chuẩn bị phản công cánh phải của đối phương bằng Pháo 9."></textarea>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-bold text-on-surface-variant">Thư mục lưu trữ</label>
              <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">create_new_folder</span>
                Thêm thư mục
              </button>
            </div>
            <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-low">
              <button
                className={`w-full p-3 text-left text-sm ${folderId === null ? 'bg-white text-primary font-bold' : 'hover:bg-white'}`}
                onClick={() => setFolderId(null)}
              >
                Khong thu muc
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className={`w-full p-3 text-left text-sm border-t border-white/50 ${folderId === folder.id ? 'bg-white text-primary font-bold' : 'hover:bg-white'}`}
                  onClick={() => setFolderId(folder.id)}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-8 py-6 bg-surface-container-low flex justify-end gap-4 border-t border-outline-variant/10">
          <button className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all" onClick={onClose}>Hủy bỏ</button>
          <button className="px-8 py-2.5 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-lg hover:bg-primary-container transition-all" onClick={save}>Lưu biến đi</button>
        </div>
      </div>
    </div>
  );
}
