import { useState } from 'react';

interface InputNotationProps {
  compact?: boolean;
  onConfirm?: (notation: string) => void;
}

export function InputNotation({ compact = false, onConfirm }: InputNotationProps) {
  const [notation, setNotation] = useState('');

  const handleConfirm = () => {
    onConfirm?.(notation);
  };

  return (
    <section className={`${compact ? 'flex flex-col' : 'hidden w-80 flex-none flex-col border-r border-outline-variant/30 bg-white font-headline dark:bg-slate-900 lg:flex'} overflow-hidden`}>
      <div className={`${compact ? 'p-4' : 'mb-4 p-6'}`}>
        <h2 className="text-on-surface font-extrabold text-lg tracking-tight">Nhập liệu biên bản</h2>
        <p className="text-on-surface-variant text-sm font-medium mt-1">Dán ký hiệu hoặc biên bản vào đây</p>
      </div>
      <div className={`${compact ? 'px-4 pb-4' : 'px-6 pb-6'} flex flex-1 flex-col gap-4`}>
        <textarea 
          value={notation}
          onChange={(event) => setNotation(event.target.value)}
          className="flex-1 w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-on-surface" 
          placeholder="Ví dụ: 1. P2-5 m8.7 2. M2.3 x9-8..."
          rows={compact ? 5 : 12}
        />
        <div className="flex flex-col gap-2">
          <button className="w-full py-3 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-md hover:bg-primary-container transition-all active:scale-[0.98]" onClick={handleConfirm}>Xác nhận</button>
          <button className="w-full py-3 text-sm font-bold text-on-surface-variant border border-outline hover:bg-surface-container-high rounded-xl transition-all active:scale-[0.98]" onClick={() => setNotation('')}>Xóa</button>
        </div>
      </div>
    </section>
  );
}
