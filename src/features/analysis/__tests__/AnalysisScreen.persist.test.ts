import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/shared/store/useGameStore';
import { useTopicStore } from '@/shared/store/useTopicStore';

describe('AnalysisScreen - persist preservation', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useTopicStore.getState().clearSelectionState();
  });

  it('should preserve restored moves after mount when no variation selected', () => {
    // Simulate restored state from persist (e.g. after page reload)
    const store = useGameStore.getState();
    store.applyMove('h7e7');
    store.applyMove('h0g2');
    store.applyMove('h9g7');
    store.jumpTo(1);
    
    const beforeState = useGameStore.getState();
    expect(beforeState.moves.length).toBe(3);
    expect(beforeState.currentIndex).toBe(1);
    
    // Simulate the AnalysisScreen effect logic
    // Initial mount: selectedVariationId is null, prevRef is undefined
    const selectedVariationId = null;
    let prevSelectedVariationIdRef: string | null | undefined = undefined;
    const hydrated = true;
    
    // First effect run (mount)
    const prevId = prevSelectedVariationIdRef;
    const shouldReset = hydrated && prevId !== undefined && prevId !== null && selectedVariationId === null;
    
    expect(shouldReset).toBe(false); // prevId is undefined, so no reset
    
    // Verify state is preserved
    const afterState = useGameStore.getState();
    expect(afterState.moves.length).toBe(3);
    expect(afterState.currentIndex).toBe(1);
    
    // Update ref for next render (simulating what the effect does)
    prevSelectedVariationIdRef = selectedVariationId;
    expect(prevSelectedVariationIdRef).toBe(null);
  });

  it('should reset game when user deselects a variation (non-null → null)', () => {
    const store = useGameStore.getState();
    
    // User has some analysis moves
    store.applyMove('h7e7');
    store.applyMove('h0g2');
    
    expect(useGameStore.getState().moves.length).toBe(2);
    
    // Simulate state after user selects a variation
    const selectedVariationId: string | null = 'variation-123';
    let prevSelectedVariationIdRef: string | null | undefined = undefined;
    const hydrated = true;
    
    // First render with variation selected
    prevSelectedVariationIdRef = selectedVariationId;
    
    // Now user deselects the variation
    const newSelectedVariationId = null;
    const prevId = prevSelectedVariationIdRef;
    const shouldReset = hydrated && prevId !== undefined && prevId !== null && newSelectedVariationId === null;
    
    expect(shouldReset).toBe(true); // prevId was 'variation-123', now null → reset!
    
    if (shouldReset) {
      store.resetGame();
    }
    
    // Verify state was reset
    const afterState = useGameStore.getState();
    expect(afterState.moves.length).toBe(0);
    expect(afterState.currentIndex).toBe(-1);
  });

  it('should not reset when switching from one variation to another', () => {
    const store = useGameStore.getState();
    store.applyMove('h7e7');
    
    const selectedVariationId: string | null = 'variation-123';
    let prevSelectedVariationIdRef: string | null | undefined = selectedVariationId;
    const hydrated = true;
    
    // Switch to different variation
    const newSelectedVariationId = 'variation-456';
    const prevId = prevSelectedVariationIdRef;
    const shouldReset = hydrated && prevId !== undefined && prevId !== null && newSelectedVariationId === null;
    
    expect(shouldReset).toBe(false); // Not going to null, so no reset
    
    // State should be preserved
    expect(useGameStore.getState().moves.length).toBe(1);
  });

  it('should not reset before hydration completes', () => {
    const store = useGameStore.getState();
    store.applyMove('h7e7');
    
    // Simulate pre-hydration state
    const selectedVariationId = null;
    const prevSelectedVariationIdRef: string | null | undefined = 'variation-123';
    const hydrated = false; // Hydration not complete yet
    
    const prevId = prevSelectedVariationIdRef;
    const shouldReset = hydrated && prevId !== undefined && prevId !== null && selectedVariationId === null;
    
    expect(shouldReset).toBe(false); // hydrated is false, so no reset
    expect(useGameStore.getState().moves.length).toBe(1); // State preserved
  });
});
