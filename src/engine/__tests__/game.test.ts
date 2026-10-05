import { describe, it, expect } from 'vitest';
import { parseFEN } from '../game';

describe('FEN Parsing', () => {
  it('should parse standard starting position', () => {
    const fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';
    const result = parseFEN(fen);

    expect(result.turn).toBe('red');
    
    expect(result.board[0][0]).toEqual({ type: 'rook', color: 'black' });
    expect(result.board[0][4]).toEqual({ type: 'king', color: 'black' });
    expect(result.board[0][8]).toEqual({ type: 'rook', color: 'black' });
    
    expect(result.board[9][0]).toEqual({ type: 'rook', color: 'red' });
    expect(result.board[9][4]).toEqual({ type: 'king', color: 'red' });
    expect(result.board[9][8]).toEqual({ type: 'rook', color: 'red' });
    
    expect(result.board[2][1]).toEqual({ type: 'cannon', color: 'black' });
    expect(result.board[7][1]).toEqual({ type: 'cannon', color: 'red' });
    
    expect(result.board[3][0]).toEqual({ type: 'pawn', color: 'black' });
    expect(result.board[6][0]).toEqual({ type: 'pawn', color: 'red' });
  });

  it('should parse FEN with black to move', () => {
    const fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR b';
    const result = parseFEN(fen);

    expect(result.turn).toBe('black');
  });

  it('should handle empty FEN with defaults', () => {
    const result = parseFEN('');

    expect(result.turn).toBe('red');
    expect(result.board[0][0]).toEqual({ type: 'rook', color: 'black' });
    expect(result.board[9][0]).toEqual({ type: 'rook', color: 'red' });
  });

  it('should parse position with pieces removed', () => {
    const fen = 'rnbakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';
    const result = parseFEN(fen);

    expect(result.board[0][7]).toBe(null);
    expect(result.board[0][8]).toEqual({ type: 'rook', color: 'black' });
  });

  it('should handle empty ranks with numbers', () => {
    const fen = '9/9/9/9/4k4/9/4K4/9/9/9 r';
    const result = parseFEN(fen);

    expect(result.board[4][4]).toEqual({ type: 'king', color: 'black' });
    expect(result.board[6][4]).toEqual({ type: 'king', color: 'red' });
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        if ((y === 4 && x === 4) || (y === 6 && x === 4)) {
          continue;
        }
        expect(result.board[y][x]).toBe(null);
      }
    }
  });
});
