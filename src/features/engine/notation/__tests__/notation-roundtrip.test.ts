import { describe, it, expect } from 'vitest';
import { createEngine } from '@/engine/engine';
import { formatMoveNotation } from '../formatMoveNotation';
import { parseVietnameseNotation } from '../parseVietnameseNotation';
import { BoardState, Move, PieceType } from '@/engine/types';

describe('Notation Round-trip Tests', () => {
  const startFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';

  // Helper to generate all legal moves from a position
  const getAllLegalMoves = (engine: ReturnType<typeof createEngine>): string[] => {
    const board = engine.getBoard();
    const turn = engine.getTurn();
    const legalMoves: string[] = [];

    // Try all possible moves from all pieces of the current side
    for (let fromY = 0; fromY < 10; fromY++) {
      for (let fromX = 0; fromX < 9; fromX++) {
        const piece = board[fromY]?.[fromX];
        if (!piece || piece.color !== turn) {
          continue;
        }

        // Try all possible destinations
        for (let toY = 0; toY < 10; toY++) {
          for (let toX = 0; toX < 9; toX++) {
            if (fromX === toX && fromY === toY) {
              continue;
            }

            const fromFile = String.fromCharCode(97 + fromX);
            const toFile = String.fromCharCode(97 + toX);
            const uci = `${fromFile}${fromY}${toFile}${toY}`;

            // Test if this move is legal by creating a temporary engine
            const testEngine = createEngine();
            testEngine.load(engine.getBoard().map(row => 
              row.map(p => p ? { ...p } : null)
            ).join('/') + ` ${turn}`);
            
            // Simplified: just try the move
            const tempEngine = createEngine();
            tempEngine.load(boardToFen(board, turn));
            if (tempEngine.applyMoveString(uci)) {
              legalMoves.push(uci);
            }
          }
        }
      }
    }

    return legalMoves;
  };

  // Helper to convert board state back to FEN
  const boardToFen = (board: BoardState, turn: 'red' | 'black'): string => {
    const pieceToFen: Record<PieceType, Record<'red' | 'black', string>> = {
      king: { red: 'K', black: 'k' },
      advisor: { red: 'A', black: 'a' },
      elephant: { red: 'B', black: 'b' },
      horse: { red: 'N', black: 'n' },
      rook: { red: 'R', black: 'r' },
      cannon: { red: 'C', black: 'c' },
      pawn: { red: 'P', black: 'p' },
    };

    const ranks = board.map(row => {
      let rankStr = '';
      let emptyCount = 0;
      
      for (const piece of row) {
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rankStr += emptyCount;
            emptyCount = 0;
          }
          rankStr += pieceToFen[piece.type][piece.color];
        }
      }
      
      if (emptyCount > 0) {
        rankStr += emptyCount;
      }
      
      return rankStr;
    });

    return ranks.join('/') + ` ${turn === 'red' ? 'r' : 'b'}`;
  };

  it('should round-trip basic cannon horizontal move', () => {
    const engine = createEngine();
    engine.load(startFen);
    
    const board = engine.getBoard();
    const move: Move = { from: { x: 7, y: 7 }, to: { x: 4, y: 7 } }; // P2-5
    
    const notation = formatMoveNotation(move, board, 'red');
    expect(notation).toBe('P2-5');
    
    const parsed = parseVietnameseNotation(notation, startFen);
    expect(Array.isArray(parsed)).toBe(true);
    if (Array.isArray(parsed)) {
      expect(parsed[0]).toBe('h7e7');
    }
  });

  it('should round-trip horse moves correctly', () => {
    const engine = createEngine();
    engine.load(startFen);
    
    // Apply opening move first
    engine.applyMoveString('h7e7'); // P2-5
    const board1 = engine.getBoard();
    
    // Black horse move m8.7
    const horseMove: Move = { from: { x: 7, y: 0 }, to: { x: 6, y: 2 } };
    const notation = formatMoveNotation(horseMove, board1, 'black');
    expect(notation).toBe('m8.7');
    
    // Parse it back
    const fullNotation = 'P2-5 m8.7';
    const parsed = parseVietnameseNotation(fullNotation, startFen);
    expect(Array.isArray(parsed)).toBe(true);
    if (Array.isArray(parsed)) {
      expect(parsed.length).toBe(2);
      expect(parsed[0]).toBe('h7e7');
      expect(parsed[1]).toBe('h0g2');
    }
  });

  it('should handle trước/sau disambiguation for doubled pieces', () => {
    // Position with two red rooks on file 9 (column a)
    const fen = '3k5/9/9/9/9/9/R8/9/R8/4K4 r';
    const engine = createEngine();
    engine.load(fen);
    
    const board = engine.getBoard();
    
    // Front rook (y=6) moves
    const frontMove: Move = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } };
    const frontNotation = formatMoveNotation(frontMove, board, 'red');
    expect(frontNotation).toBe('Xt9.1');
    
    // Back rook (y=8) moves
    const backMove: Move = { from: { x: 0, y: 8 }, to: { x: 0, y: 7 } };
    const backNotation = formatMoveNotation(backMove, board, 'red');
    expect(backNotation).toBe('Xs9.1');
    
    // Parse front move
    const parsedFront = parseVietnameseNotation('Xt9.1', fen);
    if (!Array.isArray(parsedFront)) {
      console.log('Parse error for Xt9.1:', parsedFront);
    }
    expect(Array.isArray(parsedFront)).toBe(true);
    if (Array.isArray(parsedFront)) {
      expect(parsedFront[0]).toBe('a6a5');
    }
    
    // Parse back move
    const parsedBack = parseVietnameseNotation('Xs9.1', fen);
    expect(Array.isArray(parsedBack)).toBe(true);
    if (Array.isArray(parsedBack)) {
      expect(parsedBack[0]).toBe('a8a7');
    }
  });

  it('should handle multiple horses on same file', () => {
    // Position with two horses on same file
    const fen = '4k4/9/9/9/2N6/9/2N6/9/9/4K4 r';
    const engine = createEngine();
    engine.load(fen);
    
    const board = engine.getBoard();
    
    // Front horse (y=4) moves to (x=1, y=6) - which is file 8 for red
    const frontMove: Move = { from: { x: 2, y: 4 }, to: { x: 1, y: 6 } };
    const frontNotation = formatMoveNotation(frontMove, board, 'red');
    expect(frontNotation).toBe('Mt7+8'); // File 7 to file 8, backward
    
    // Back horse (y=6) moves to (x=3, y=8) - which is file 6 for red
    const backMove: Move = { from: { x: 2, y: 6 }, to: { x: 3, y: 8 } };
    const backNotation = formatMoveNotation(backMove, board, 'red');
    expect(backNotation).toBe('Ms7+6'); // File 7 to file 6, backward
  });

  it('should play random legal games and verify round-trip', { timeout: 30000 }, () => {
    const gamesToTest = 15;
    const maxMovesPerGame = 25;
    let totalMovesTested = 0;
    let totalRoundTripSuccesses = 0;

    for (let gameNum = 0; gameNum < gamesToTest; gameNum++) {
      const engine = createEngine();
      engine.load(startFen);
      
      const moveHistory: string[] = [];
      const notationHistory: string[] = [];
      
      for (let moveCount = 0; moveCount < maxMovesPerGame; moveCount++) {
        const board = engine.getBoard();
        const turn = engine.getTurn();
        
        // Get all legal moves
        const legalMoves: string[] = [];
        for (let fromY = 0; fromY < 10; fromY++) {
          for (let fromX = 0; fromX < 9; fromX++) {
            const piece = board[fromY]?.[fromX];
            if (!piece || piece.color !== turn) {
              continue;
            }
            
            for (let toY = 0; toY < 10; toY++) {
              for (let toX = 0; toX < 9; toX++) {
                if (fromX === toX && fromY === toY) {
                  continue;
                }
                
                const fromFile = String.fromCharCode(97 + fromX);
                const toFile = String.fromCharCode(97 + toX);
                const uci = `${fromFile}${fromY}${toFile}${toY}`;
                
                const testEngine = createEngine();
                testEngine.load(boardToFen(board, turn));
                if (testEngine.applyMoveString(uci)) {
                  legalMoves.push(uci);
                }
              }
            }
          }
        }
        
        if (legalMoves.length === 0) {
          break; // No legal moves (game over)
        }
        
        // Pick a random legal move
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        
        // Extract move coordinates
        const fromX = randomMove.charCodeAt(0) - 97;
        const fromY = parseInt(randomMove[1]);
        const toX = randomMove.charCodeAt(2) - 97;
        const toY = parseInt(randomMove[3]);
        
        const move: Move = {
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY }
        };
        
        // Format the move
        const notation = formatMoveNotation(move, board, turn);
        
        // Apply the move
        const success = engine.applyMoveString(randomMove);
        if (!success) {
          break;
        }
        
        moveHistory.push(randomMove);
        notationHistory.push(notation);
        totalMovesTested++;
      }
      
      // Now verify round-trip: parse all notation back
      if (notationHistory.length > 0) {
        const fullNotation = notationHistory.join(' ');
        const parsed = parseVietnameseNotation(fullNotation, startFen);
        
        if (Array.isArray(parsed)) {
          // Check if parsed moves match original moves
          const matches = parsed.length === moveHistory.length &&
            parsed.every((parsedUci, idx) => parsedUci === moveHistory[idx]);
          
          if (matches) {
            totalRoundTripSuccesses += parsed.length;
          } else {
            // Log the first mismatch for debugging
            for (let i = 0; i < Math.min(parsed.length, moveHistory.length); i++) {
              if (parsed[i] !== moveHistory[i]) {
                console.log(`Mismatch at move ${i+1}: notation="${notationHistory[i]}" expected="${moveHistory[i]}" got="${parsed[i]}"`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Expect at least 95% success rate
    const successRate = totalMovesTested > 0 ? totalRoundTripSuccesses / totalMovesTested : 0;
    expect(successRate).toBeGreaterThan(0.95);
    expect(totalMovesTested).toBeGreaterThan(0);
  });

  it('should handle elephant diagonal moves', () => {
    const fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';
    const engine = createEngine();
    engine.load(fen);
    
    // Play some moves to get elephant active
    engine.applyMoveString('g9e7'); // T7.5
    const board = engine.getBoard();
    const move: Move = { from: { x: 4, y: 7 }, to: { x: 2, y: 9 } };
    
    const notation = formatMoveNotation(move, board, 'red');
    expect(notation).toMatch(/T5\+7/);
  });

  it('should handle pawn forward and sideways moves', () => {
    const fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r';
    const engine = createEngine();
    engine.load(fen);
    
    // Red pawn
    const board = engine.getBoard();
    const pawnMove: Move = { from: { x: 6, y: 6 }, to: { x: 6, y: 5 } };
    const notation = formatMoveNotation(pawnMove, board, 'red');
    expect(notation).toBe('B3.1');
  });
});
