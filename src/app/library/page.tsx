'use client';

import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { Board } from "@/components/Board/Board";
import { TopicTreeView } from "@/components/TopicTreeView";
import { MoveListPanel } from "@/components/MoveListPanel";
import { QuickStatsWidget } from "@/components/QuickStatsWidget";
import { NewVariationModal } from "@/app/components/NewVariationModal";
import { useState } from "react";

export default function LibraryPage() {
  const { board, makeMove, undo, redo, reset } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const hydrated = useHasHydrated();
  if (!hydrated) return null;

  return (
    <div className="flex h-full w-full bg-surface text-on-surface overflow-hidden">
      {/* Left Column: Topic TreeView */}
      <aside className="w-80 bg-surface-container-low flex flex-col border-r border-outline-variant/30 hidden lg:flex">
        <TopicTreeView />
      </aside>

      {/* Center Column: Interactive Xiangqi Board */}
      <section className="flex-1 bg-surface flex flex-col items-center justify-center p-8 relative overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden p-8 border border-outline-variant/20">
          <Board board={board} onMove={makeMove} />
        </div>

        {/* Controls Overlay */}
        <div className="mt-8 flex items-center gap-6 bg-surface-container-lowest px-6 py-3 rounded-2xl shadow-sm border border-outline-variant/20">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={reset}>
            <span className="material-symbols-outlined">first_page</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={undo}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-primary rounded-full text-on-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" onClick={redo}>
            <span className="material-symbols-outlined text-3xl">play_arrow</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={redo}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">last_page</span>
          </button>
          <div className="h-6 w-px bg-outline-variant/30 mx-2"></div>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={reset}>
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary" onClick={() => setShowModal(true)}>
            Luu bien
          </button>
        </div>
      </section>

      {/* Right Column: Move List */}
      <aside className="w-80 bg-surface-container-low flex flex-col border-l border-outline-variant/30 hidden xl:flex">
        <MoveListPanel variant="library" />
      </aside>

      <QuickStatsWidget />
      <NewVariationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
