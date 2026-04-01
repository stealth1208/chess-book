import { BoardState } from "./types";

export function createInitialBoard(): BoardState {
  const board: BoardState = Array.from({ length: 10 }, () => Array(9).fill(null));

  // Red is bottom (y=9), Black is top (y=0)

  // Black pieces
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][1] = { type: 'horse', color: 'black' };
  board[0][2] = { type: 'elephant', color: 'black' };
  board[0][3] = { type: 'advisor', color: 'black' };
  board[0][4] = { type: 'king', color: 'black' };
  board[0][5] = { type: 'advisor', color: 'black' };
  board[0][6] = { type: 'elephant', color: 'black' };
  board[0][7] = { type: 'horse', color: 'black' };
  board[0][8] = { type: 'rook', color: 'black' };

  board[2][1] = { type: 'cannon', color: 'black' };
  board[2][7] = { type: 'cannon', color: 'black' };

  board[3][0] = { type: 'pawn', color: 'black' };
  board[3][2] = { type: 'pawn', color: 'black' };
  board[3][4] = { type: 'pawn', color: 'black' };
  board[3][6] = { type: 'pawn', color: 'black' };
  board[3][8] = { type: 'pawn', color: 'black' };

  // Red pieces
  board[9][0] = { type: 'rook', color: 'red' };
  board[9][1] = { type: 'horse', color: 'red' };
  board[9][2] = { type: 'elephant', color: 'red' };
  board[9][3] = { type: 'advisor', color: 'red' };
  board[9][4] = { type: 'king', color: 'red' };
  board[9][5] = { type: 'advisor', color: 'red' };
  board[9][6] = { type: 'elephant', color: 'red' };
  board[9][7] = { type: 'horse', color: 'red' };
  board[9][8] = { type: 'rook', color: 'red' };

  board[7][1] = { type: 'cannon', color: 'red' };
  board[7][7] = { type: 'cannon', color: 'red' };

  board[6][0] = { type: 'pawn', color: 'red' };
  board[6][2] = { type: 'pawn', color: 'red' };
  board[6][4] = { type: 'pawn', color: 'red' };
  board[6][6] = { type: 'pawn', color: 'red' };
  board[6][8] = { type: 'pawn', color: 'red' };

  return board;
}
