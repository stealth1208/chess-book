'use client';

import { useGameStore } from '@/store/useGameStore';

export function useLibraryVariationLoad() {
  const { selectedVariationId, loadVariationById } = useGameStore();

  return {
    selectedVariationId,
    loadVariationById,
  };
}
