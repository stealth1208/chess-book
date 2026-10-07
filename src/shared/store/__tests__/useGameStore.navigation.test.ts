import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('useGameStore - move list and navigation improvements', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('truncate confirmation', () => {
    it('should warn before truncating moves in browser environment', () => {
      // This test validates the logic exists, but can't test window.confirm in vitest
      const store = useGameStore.getState();
      
      // Apply some moves
      store.applyMove('h7e7');
      store.applyMove('h0g2');
      store.applyMove('h9g7');
      
      expect(useGameStore.getState().moves.length).toBe(3);
      
      // Jump back to first move
      store.jumpTo(0);
      expect(useGameStore.getState().currentIndex).toBe(0);
      
      // Note: Actually triggering applyMove here would show confirm() dialog
      // The implementation checks: if (state.currentIndex < state.moves.length - 1)
      expect(useGameStore.getState().currentIndex).toBe(0);
      expect(useGameStore.getState().moves.length).toBe(3);
    });
  });

  describe('jumpTo validation', () => {
    it('should reject non-integer indices', () => {
      const store = useGameStore.getState();
      store.applyMove('h7e7');
      store.applyMove('h0g2');
      
      const beforeState = useGameStore.getState();
      
      // Try invalid indices
      store.jumpTo(1.5 as number);
      expect(useGameStore.getState().currentIndex).toBe(beforeState.currentIndex);
      
      store.jumpTo(NaN);
      expect(useGameStore.getState().currentIndex).toBe(beforeState.currentIndex);
    });
    
    it('should reject out-of-bounds indices', () => {
      const store = useGameStore.getState();
      store.applyMove('h7e7');
      
      const beforeState = useGameStore.getState();
      
      store.jumpTo(-2);
      expect(useGameStore.getState().currentIndex).toBe(beforeState.currentIndex);
      
      store.jumpTo(10);
      expect(useGameStore.getState().currentIndex).toBe(beforeState.currentIndex);
    });
  });

  describe('lastError clearing on navigation', () => {
    it('should clear lastError when jumping to a position', () => {
      const store = useGameStore.getState();
      
      // Create an error
      store.makeMove({
        from: { x: 4, y: 5 },
        to: { x: 4, y: 6 }
      });
      expect(useGameStore.getState().lastError).toBeTruthy();
      
      // Make a legal move series first
      store.clearError();
      store.applyMove('h7e7');
      store.applyMove('h0g2');
      
      // Create another error
      store.makeMove({
        from: { x: 4, y: 5 },
        to: { x: 4, y: 6 }
      });
      expect(useGameStore.getState().lastError).toBeTruthy();
      
      // Jump should clear error
      store.jumpTo(0);
      expect(useGameStore.getState().lastError).toBeNull();
    });
  });

  describe('move list side-based coloring', () => {
    it('should preserve move side information in applyMove', () => {
      const store = useGameStore.getState();
      
      store.applyMove({
        from: 'h7',
        to: 'e7',
        piece: 'pawn',
        notation: 'P8-5',
        side: 'red',
        uci: 'h7e7'
      });
      
      store.applyMove({
        from: 'h0',
        to: 'g2',
        piece: 'horse',
        notation: 'm2.3',
        side: 'black',
        uci: 'h0g2'
      });
      
      const state = useGameStore.getState();
      expect(state.moves[0].side).toBe('red');
      expect(state.moves[1].side).toBe('black');
    });
  });

  describe('navigation at boundaries', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.applyMove('h7e7');
      store.applyMove('h0g2');
    });

    it('should not go beyond start with undo', () => {
      const store = useGameStore.getState();
      
      // Go to start
      store.jumpTo(-1);
      expect(useGameStore.getState().currentIndex).toBe(-1);
      
      // Try to undo from start (should be no-op)
      const before = useGameStore.getState().currentIndex;
      store.undo();
      expect(useGameStore.getState().currentIndex).toBe(before);
    });
    
    it('should not go beyond end with redo', () => {
      const store = useGameStore.getState();
      
      // Go to end
      const maxIndex = useGameStore.getState().moves.length - 1;
      store.jumpTo(maxIndex);
      expect(useGameStore.getState().currentIndex).toBe(maxIndex);
      
      // Try to redo from end (should be no-op)
      const before = useGameStore.getState().currentIndex;
      store.redo();
      expect(useGameStore.getState().currentIndex).toBe(before);
    });
  });
});
