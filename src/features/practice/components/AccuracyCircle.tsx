interface AccuracyCircleProps {
  correct: number;
  wrong: number;
}

export function AccuracyCircle({ correct, wrong }: AccuracyCircleProps) {
  const total = correct + wrong;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="relative flex flex-col items-center mb-8">
      <div className="w-40 h-40 rounded-full border-[12px] border-surface-container-high flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent -rotate-45"></div>
        <div className="text-center">
          <span className="block text-4xl font-headline font-extrabold text-primary">{`${percent}%`}</span>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Độ chính xác</span>
        </div>
      </div>
    </div>
  );
}
