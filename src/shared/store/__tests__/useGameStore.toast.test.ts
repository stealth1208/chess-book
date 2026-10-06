import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('useGameStore - illegal move error handling', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should set lastError when makeMove fails', () => {
    const store = useGameStore.getState();
    
    // Try an illegal move (moving from empty square)
    const success = store.makeMove({
      from: { x: 4, y: 5 },
      to: { x: 4, y: 6 }
    });
    
    expect(success).toBe(false);
    expect(useGameStore.getState().lastError).toBeTruthy();
  });

  it('should allow reading lastError after makeMove returns', () => {
    const store = useGameStore.getState();
    
    // Try an illegal move
    const success = store.makeMove({
      from: { x: 4, y: 5 },
      to: { x: 4, y: 6 }
    });
    
    expect(success).toBe(false);
    
    // This simulates what AnalysisScreen should do
    const currentError = useGameStore.getState().lastError;
    expect(currentError).toBeTruthy();
    expect(typeof currentError).toBe('string');
  });

  it('should clear lastError after clearError is called', () => {
    const store = useGameStore.getState();
    
    // Make an illegal move to set error
    store.makeMove({
      from: { x: 4, y: 5 },
      to: { x: 4, y: 6 }
    });
    
    expect(useGameStore.getState().lastError).toBeTruthy();
    
    // Clear error
    store.clearError();
    
    expect(useGameStore.getState().lastError).toBeNull();
  });

  it('should clear lastError manually via clearError', () => {
    const store = useGameStore.getState();
    
    // First, create an error
    store.makeMove({
      from: { x: 4, y: 5 },
      to: { x: 4, y: 6 }
    });
    expect(useGameStore.getState().lastError).toBeTruthy();
    
    // Manually clear the error
    store.clearError();
    expect(useGameStore.getState().lastError).toBeNull();
    
    // Note: Testing successful move clearing would require fixing BUG-6 first
    // (makeMove uses require('@/engine/engine') which breaks under vitest)
  });
});
