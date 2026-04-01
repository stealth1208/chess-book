'use client';

import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { Board } from "@/components/Board/Board";
import { AccuracyCircle } from "./components/AccuracyCircle";
import { ActionButtons } from "./components/ActionButtons";
import { ControlGroups } from "./components/ControlGroups";
import { formatMove } from "@/engine/game";
import { Move } from "@/engine/types";
import { useEffect, useMemo, useState } from "react";

export default function PracticePage() {
  const {
    board,
    variations,
    selectedVariationId,
    practiceVariationId,
    practiceExpectedMoves,
    practiceIndex,
    practiceCorrect,
    practiceWrong,
    startPractice,
    submitPracticeMove,
    resetPractice,
  } = useGameStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (practiceVariationId) {
      return;
    }

    const defaultVariationId = selectedVariationId ?? variations[0]?.id;
    if (defaultVariationId) {
      startPractice(defaultVariationId);
    }
  }, [practiceVariationId, selectedVariationId, startPractice, variations]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const activeVariation = useMemo(
    () => variations.find((variation) => variation.id === practiceVariationId) ?? null,
    [practiceVariationId, variations]
  );

  const handlePracticeMove = (move: Move) => {
    submitPracticeMove(formatMove(move));
  };

  const hydrated = useHasHydrated();
  if (!hydrated) return null;

  return (
    <div className="flex h-full w-full bg-surface text-on-surface overflow-hidden">
      {/* Left: Topic TreeView */}
      <aside className="w-80 bg-surface-container-low hidden lg:flex flex-col border-r border-outline-variant/30 py-6 px-4">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-on-surface">Lộ trình khai cuộc</h2>
          <p className="text-xs text-on-surface-variant">Pháo Đầu đối Bình Phong Mã</p>
        </div>
        <div className="space-y-1 flex-1">
          {variations.map((variation) => (
            <button
              key={variation.id}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                variation.id === practiceVariationId
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-500 hover:translate-x-1'
              }`}
              onClick={() => {
                startPractice(variation.id);
                setElapsedSeconds(0);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
              <span className="text-sm font-medium">{variation.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto bg-surface-container-highest p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">history</span>
            <span className="text-xs font-bold uppercase tracking-wider">Lịch sử tập luyện</span>
          </div>
          <div className="text-[10px] space-y-2 text-on-surface-variant">
            <div className="flex justify-between"><span>Hôm qua</span> <span className="text-tertiary">92%</span></div>
            <div className="flex justify-between"><span>02/11</span> <span className="text-secondary">78%</span></div>
          </div>
        </div>
      </aside>

      {/* Center: Interactive Board */}
      <section className="flex-1 bg-surface p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full mb-2 uppercase tracking-widest">Đang thực hành</span>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface">{activeVariation?.name ?? 'Chua chon bien'}</h1>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-all" onClick={() => { resetPractice(); setElapsedSeconds(0); }}>
                <span className="material-symbols-outlined text-lg">refresh</span> Làm lại
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Board board={board} onMove={handlePracticeMove} />
          </div>

          <ControlGroups
            elapsedSeconds={elapsedSeconds}
            moveCount={practiceCorrect + practiceWrong}
            progressLabel={`${practiceIndex}/${practiceExpectedMoves.length}`}
          />
        </div>
      </section>

      {/* Right: Scoring & Analysis */}
      <aside className="w-96 bg-white hidden xl:block py-8 px-6 overflow-y-auto border-l border-outline-variant/30">
        <h3 className="font-headline text-xl font-bold mb-6">Phân tích thực hành</h3>
        <AccuracyCircle correct={practiceCorrect} wrong={practiceWrong} />
        <ActionButtons
          correct={practiceCorrect}
          wrong={practiceWrong}
          onReset={() => {
            resetPractice();
            setElapsedSeconds(0);
          }}
        />
      </aside>
    </div>
  );
}
