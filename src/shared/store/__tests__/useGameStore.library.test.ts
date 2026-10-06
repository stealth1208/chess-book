import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';

describe('useGameStore - library replay navigation', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should load variation at starting position (currentIndex = -1)', () => {
    const store = useGameStore.getState();
    const moves = [
      { from: 'h7', to: 'e7', piece: 'pawn', notation: 'P8-5', side: 'red' as const, uci: 'h7e7' },
      { from: 'h0', to: 'g2', piece: 'horse', notation: 'm2.3', side: 'black' as const, uci: 'h0g2' },
    ];
    
    store.loadVariation('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r', moves);
    
    const state = useGameStore.getState();
    expect(state.moves.length).toBe(2);
    expect(state.currentIndex).toBe(-1);
    expect(state.boards.length).toBeGreaterThan(0);
  });

  it('should allow jumping to any move after loading variation', () => {
    const store = useGameStore.getState();
    const moves = [
      { from: 'h7', to: 'e7', piece: 'pawn', notation: 'P8-5', side: 'red' as const, uci: 'h7e7' },
      { from: 'h0', to: 'g2', piece: 'horse', notation: 'm2.3', side: 'black' as const, uci: 'h0g2' },
      { from: 'h9', to: 'g7', piece: 'horse', notation: 'M2.3', side: 'red' as const, uci: 'h9g7' },
    ];
    
    store.loadVariation('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r', moves);
    
    // Jump to first move
    store.jumpTo(0);
    expect(useGameStore.getState().currentIndex).toBe(0);
    
    // Jump to second move
    store.jumpTo(1);
    expect(useGameStore.getState().currentIndex).toBe(1);
    
    // Jump to last move
    store.jumpTo(2);
    expect(useGameStore.getState().currentIndex).toBe(2);
    
    // Jump back to start
    store.jumpTo(-1);
    expect(useGameStore.getState().currentIndex).toBe(-1);
  });

  it('should allow undo/redo navigation after loading variation', () => {
    const store = useGameStore.getState();
    const moves = [
      { from: 'h7', to: 'e7', piece: 'pawn', notation: 'P8-5', side: 'red' as const, uci: 'h7e7' },
      { from: 'h0', to: 'g2', piece: 'horse', notation: 'm2.3', side: 'black' as const, uci: 'h0g2' },
    ];
    
    store.loadVariation('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r', moves);
    expect(useGameStore.getState().currentIndex).toBe(-1);
    
    // Redo to advance (same as clicking "next")
    store.redo();
    expect(useGameStore.getState().currentIndex).toBe(0);
    
    store.redo();
    expect(useGameStore.getState().currentIndex).toBe(1);
    
    // Undo to go back
    store.undo();
    expect(useGameStore.getState().currentIndex).toBe(0);
    
    store.undo();
    expect(useGameStore.getState().currentIndex).toBe(-1);
  });

  it('should have boards matching the current index after loadVariation', () => {
    const store = useGameStore.getState();
    const moves = [
      { from: 'h7', to: 'e7', piece: 'pawn', notation: 'P8-5', side: 'red' as const, uci: 'h7e7' },
    ];
    
    store.loadVariation('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r', moves);
    
    const startState = useGameStore.getState();
    expect(startState.boards.length).toBe(2); // start board + 1 move
    expect(startState.currentIndex).toBe(-1);
    expect(startState.board).toBe(startState.boards[0]); // at start
    
    // After advancing
    store.redo();
    const afterMoveState = useGameStore.getState();
    expect(afterMoveState.currentIndex).toBe(0);
    expect(afterMoveState.board).toBe(afterMoveState.boards[1]); // at first move
  });

  it('should clear lastError when loading variation', () => {
    const store = useGameStore.getState();
    
    // Create an error first
    store.makeMove({
      from: { x: 4, y: 5 },
      to: { x: 4, y: 6 }
    });
    expect(useGameStore.getState().lastError).toBeTruthy();
    
    // Load a variation
    const moves = [
      { from: 'h7', to: 'e7', piece: 'pawn', notation: 'P8-5', side: 'red' as const, uci: 'h7e7' },
    ];
    store.loadVariation('rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r', moves);
    
    // Error should be cleared
    expect(useGameStore.getState().lastError).toBeNull();
  });
});
