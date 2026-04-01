export function QuickStatsWidget() {
  return (
    <div className="fixed bottom-8 right-8 bg-surface-container-low/70 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 flex gap-6 items-center z-50">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">Engine Depth</span>
        <span className="text-sm font-headline font-bold text-primary">24 Plies</span>
      </div>
      <div className="w-px h-8 bg-outline-variant/30"></div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-60">Evaluation</span>
        <span className="text-sm font-headline font-bold text-tertiary">+0.45</span>
      </div>
      <button className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 transition-transform">
        <span className="material-symbols-outlined">memory</span>
      </button>
    </div>
  );
}
