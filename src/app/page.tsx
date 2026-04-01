'use client';

import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { Board } from "@/components/Board/Board";
import { MoveListPanel } from "@/components/MoveListPanel";
import { InputNotation } from "./components/InputNotation";
import { NewVariationModal } from "./components/NewVariationModal";
import { useState } from "react";

export default function AnalysisPage() {
  const { board, makeMove, undo, redo, reset } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const hydrated = useHasHydrated();
  if (!hydrated) return null;

  return (
    <div className="flex h-full w-full bg-surface text-on-surface">
      <InputNotation />

      {/* Main Content Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto p-6 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
          
          {/* Center Column: Chess Board & Evaluation */}
          <section className="xl:col-span-9 flex items-start justify-center gap-6">
            {/* Vertical Score Bar */}
            <div className="flex flex-col items-center h-[550px] mt-6 w-12 hidden md:flex">
              <div className="text-[10px] font-bold text-primary mb-1 tracking-tighter">+1.42</div>
              <div className="flex-1 w-2.5 bg-on-surface rounded-full overflow-hidden flex flex-col-reverse">
                <div className="bg-primary w-full transition-all duration-500" style={{ height: '65%' }}></div>
              </div>
              <div className="text-[10px] font-bold text-on-surface mt-1 tracking-tighter">-1.42</div>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-outline-variant/20">
                <Board board={board} onMove={makeMove} />
              </div>
              
              {/* Board Controls */}
              <div className="mt-6 flex justify-center gap-6 w-full max-w-sm">
                <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface transition-all active:scale-90" onClick={reset}>
                  <span className="material-symbols-outlined">first_page</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface transition-all active:scale-90" onClick={undo}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-xl hover:bg-primary-container transition-all active:scale-95">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface transition-all active:scale-90" onClick={redo}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface transition-all active:scale-90">
                  <span className="material-symbols-outlined">last_page</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Move List */}
          <section className="xl:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-outline-variant/20 flex flex-col h-[650px] overflow-hidden">
              <MoveListPanel variant="analysis" />
            </div>
          </section>
        </div>
      </div>
      
      <NewVariationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
