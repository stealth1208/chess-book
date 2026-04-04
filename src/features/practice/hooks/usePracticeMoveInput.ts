'use client';

import { formatMove } from '@/engine/game';
import type { Move } from '@/engine/types';
import { useGameStore } from '@/shared/store/useGameStore';

export function usePracticeMoveInput() {
  const { submitPracticeMove } = useGameStore();

  const submitMove = (move: Move) => submitPracticeMove(formatMove(move));

  return { submitMove };
}
