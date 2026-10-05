import { describe, it, expect } from 'vitest';
import { validateMove } from '../rules';
import { createInitialBoard } from '../board';
import { BoardState } from '../types';

describe('Flying General Rule', () => {
  it('should prevent move that creates flying general', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    
    board[0][4] = { type: 'king', color: 'black' };
    board[9][4] = { type: 'king', color: 'red' };
    board[5][4] = { type: 'advisor', color: 'red' };

    const move = {
      from: { x: 4, y: 5 },
      to: { x: 5, y: 6 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(false);
  });

  it('should allow move when kings are not facing', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    
    board[0][4] = { type: 'king', color: 'black' };
    board[9][3] = { type: 'king', color: 'red' };
    board[8][4] = { type: 'advisor', color: 'red' };

    const move = {
      from: { x: 4, y: 8 },
      to: { x: 5, y: 9 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(true);
  });

  it('should allow move when there is a piece between kings', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    
    board[0][4] = { type: 'king', color: 'black' };
    board[9][4] = { type: 'king', color: 'red' };
    board[5][4] = { type: 'pawn', color: 'red' };
    board[8][4] = { type: 'advisor', color: 'red' };

    const move = {
      from: { x: 4, y: 8 },
      to: { x: 3, y: 7 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(true);
  });
});

describe('Basic Move Validation', () => {
  it('should validate king can move within palace', () => {
    const board = createInitialBoard();
    
    const move = {
      from: { x: 4, y: 9 },
      to: { x: 4, y: 8 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(true);
  });

  it('should prevent king from leaving palace', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    board[9][4] = { type: 'king', color: 'red' };

    const move = {
      from: { x: 4, y: 9 },
      to: { x: 2, y: 9 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(false);
  });

  it('should validate cannon jump capture', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    board[7][1] = { type: 'cannon', color: 'red' };
    board[5][1] = { type: 'pawn', color: 'red' };
    board[3][1] = { type: 'pawn', color: 'black' };

    const move = {
      from: { x: 1, y: 7 },
      to: { x: 1, y: 3 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(true);
  });

  it('should prevent cannon from capturing without jump', () => {
    const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));
    board[7][1] = { type: 'cannon', color: 'red' };
    board[3][1] = { type: 'pawn', color: 'black' };

    const move = {
      from: { x: 1, y: 7 },
      to: { x: 1, y: 3 },
    };

    const result = validateMove(board, move);
    expect(result).toBe(false);
  });
});
