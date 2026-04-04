'use client';

import { useGameStore } from '@/shared/store/useGameStore';

export function useLibraryVariationLoad() {
  const { selectedVariationId, loadVariationById } = useGameStore();

  return {
    selectedVariationId,
    loadVariationById,
  };
}
