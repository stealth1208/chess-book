interface ActionButtonsProps {
  correct: number;
  wrong: number;
  onReset: () => void;
}

export function ActionButtons({ correct, wrong, onReset }: ActionButtonsProps) {
  return (
    <>
      {/* Stats Grid */}
      <div className="space-y-4 mb-8">
        <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold">Nước đi tốt nhất</p>
              <p className="text-lg font-headline font-bold text-tertiary">{correct}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">error</span>
            </div>
            <div>
              <p className="text-xs font-bold">Sai lầm (Blunders)</p>
              <p className="text-lg font-headline font-bold text-error">{wrong}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-headline font-bold">Gợi ý sửa lỗi</h4>
          <span className="text-[10px] font-bold text-primary uppercase cursor-pointer hover:underline">Xem tất cả</span>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-surface rounded-xl border-l-4 border-primary shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-primary">Nước thứ 8</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-outline-variant">Mã 2 tiến 3</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Thay vì tiến Mã, bạn nên <span className="font-bold text-on-surface">Bình Pháo 5</span> để kiểm soát trung lộ tốt hơn.
            </p>
          </div>
          <div className="p-4 bg-surface rounded-xl border-l-4 border-tertiary shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-tertiary">Mẹo chiến thuật</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Trong biến thể này, ưu tiên giữ cặp Pháo để tạo sức ép từ xa.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-8 py-4 bg-primary text-on-primary rounded-2xl font-headline font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" onClick={onReset}>
        Làm mới phiên luyện tập
      </button>
    </>
  );
}
