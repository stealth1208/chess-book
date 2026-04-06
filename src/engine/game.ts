import { Coordinate, Move, BoardState } from "./types";
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

export const parseFEN = (_fen: string): BoardState => {
  void _fen;
  // Stub for now, can implement standard FEN mapping later
  return createInitialBoard();
};
