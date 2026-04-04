'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/shared/store/useGameStore';

export function usePracticeSessionControls() {
  const {
    variations,
    selectedVariationId,
    practiceVariationId,
    startPractice,
    resetPractice,
  } = useGameStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (practiceVariationId) return;
    const defaultVariationId = selectedVariationId ?? variations[0]?.id;
    if (defaultVariationId) {
      startPractice(defaultVariationId);
    }
  }, [practiceVariationId, selectedVariationId, startPractice, variations]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startVariation = (variationId: string) => {
    startPractice(variationId);
    setElapsedSeconds(0);
  };

  const resetSession = () => {
    resetPractice();
    setElapsedSeconds(0);
  };

  return {
    elapsedSeconds,
    startVariation,
    resetSession,
  };
}
