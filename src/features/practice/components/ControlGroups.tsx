interface ControlGroupsProps {
  elapsedSeconds: number;
  moveCount: number;
  progressLabel: string;
}

function toClock(seconds: number): string {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function ControlGroups({ elapsedSeconds, moveCount, progressLabel }: ControlGroupsProps) {
  return (
    <div className="mt-8 grid grid-cols-3 gap-4">
      <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center">
        <span className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter mb-1">Thời gian</span>
        <span className="text-2xl font-headline font-bold">{toClock(elapsedSeconds)}</span>
      </div>
      <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center">
        <span className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter mb-1">Nước đi</span>
        <span className="text-2xl font-headline font-bold">{moveCount}</span>
      </div>
      <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center">
        <span className="text-xs text-on-surface-variant uppercase font-bold tracking-tighter mb-1">Gợi ý</span>
        <span className="text-2xl font-headline font-bold">{progressLabel}</span>
      </div>
    </div>
  );
}
