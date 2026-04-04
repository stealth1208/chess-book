export function InputNotation() {
  return (
    <aside className="hidden lg:flex flex-col flex-none w-80 bg-white dark:bg-slate-900 border-r border-outline-variant/30 font-headline overflow-hidden">
      <div className="p-6 mb-4">
        <h2 className="text-on-surface font-extrabold text-lg tracking-tight">Nhập liệu biên bản</h2>
        <p className="text-on-surface-variant text-sm font-medium mt-1">Dán ký hiệu hoặc biên bản vào đây</p>
      </div>
      <div className="px-6 flex-1 flex flex-col gap-4 pb-6">
        <textarea 
          className="flex-1 w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-on-surface" 
          placeholder="Ví dụ: 1. P2-5 M8.7 2. M2.3 X9-8..."
        />
        <div className="flex flex-col gap-2">
          <button className="w-full py-3 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-md hover:bg-primary-container transition-all active:scale-[0.98]">Xác nhận</button>
          <button className="w-full py-3 text-sm font-bold text-on-surface-variant border border-outline hover:bg-surface-container-high rounded-xl transition-all active:scale-[0.98]">Xóa</button>
        </div>
      </div>
    </aside>
  );
}
