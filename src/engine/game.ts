import { Coordinate, Move, BoardState, PieceColor, Piece } from "./types";
import { createInitialBoard } from "./board";

export const formatMove = (move: Move) => {
  const fileFrom = String.fromCharCode(97 + move.from.x);
  const fileTo = String.fromCharCode(97 + move.to.x);
  return `${fileFrom}${move.from.y}${fileTo}${move.to.y}`;
};

export const parseMove = (moveStr: string): { from: Coordinate, to: Coordinate } => {
  return {
    from: {
      x: moveStr.charCodeAt(0) - 97,
      y: parseInt(moveStr[1], 10)
    },
    to: {
      x: moveStr.charCodeAt(2) - 97,
      y: parseInt(moveStr[3], 10)
    }
  };
};

const PIECE_FEN_MAP: Record<string, Piece> = {
  'R': { type: 'rook', color: 'red' },
  'N': { type: 'horse', color: 'red' },
  'B': { type: 'elephant', color: 'red' },
  'A': { type: 'advisor', color: 'red' },
  'K': { type: 'king', color: 'red' },
  'C': { type: 'cannon', color: 'red' },
  'P': { type: 'pawn', color: 'red' },
  'r': { type: 'rook', color: 'black' },
  'n': { type: 'horse', color: 'black' },
  'b': { type: 'elephant', color: 'black' },
  'a': { type: 'advisor', color: 'black' },
  'k': { type: 'king', color: 'black' },
  'c': { type: 'cannon', color: 'black' },
  'p': { type: 'pawn', color: 'black' },
};

export const parseFEN = (fen: string): { board: BoardState; turn: PieceColor } => {
  if (!fen || fen.trim() === '') {
    return { board: createInitialBoard(), turn: 'red' };
  }

  const parts = fen.trim().split(/\s+/);
  const boardPart = parts[0];
  const turnPart = parts[1];

  const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));

  const ranks = boardPart.split('/');
  
  if (ranks.length !== 10) {
    return { board: createInitialBoard(), turn: 'red' };
  }

  for (let y = 0; y < 10; y++) {
    const rank = ranks[y];
    let x = 0;

    for (let i = 0; i < rank.length; i++) {
      const char = rank[i];
      
      if (char >= '1' && char <= '9') {
        x += parseInt(char, 10);
      } else if (PIECE_FEN_MAP[char]) {
        if (x < 9) {
          board[y][x] = { ...PIECE_FEN_MAP[char] };
          x++;
        }
      }
    }
  }

  const turn: PieceColor = (turnPart === 'b' || turnPart === 'black') ? 'black' : 'red';

  return { board, turn };
};
