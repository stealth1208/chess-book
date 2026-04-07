import { parseFEN, parseMove } from './game';
import { validateMove } from './rules';
import { BoardState, Move, PieceColor } from './types';

export type Engine = {
  load(fen: string): void;
  getBoard(): BoardState;
  getTurn(): PieceColor;
  applyMoveString(move: string): boolean;
};

const cloneBoard = (board: BoardState): BoardState =>
  board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));

const isValidCoordinate = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

export const createEngine = (): Engine => {
  let board = parseFEN('');
  let turn: PieceColor = 'black';

  return {
    load: (fen: string) => {
      board = cloneBoard(parseFEN(fen));
      turn = 'black';
    },

    getBoard: () => cloneBoard(board),

    getTurn: () => turn,

    applyMoveString: (moveString: string) => {
      if (moveString.length !== 4) {
        return false;
      }

      const parsed = parseMove(moveString);
      const move: Move = {
        from: parsed.from,
        to: parsed.to,
      };

      if (
        !isValidCoordinate(move.from.x, 0, 8) ||
        !isValidCoordinate(move.from.y, 0, 9) ||
        !isValidCoordinate(move.to.x, 0, 8) ||
        !isValidCoordinate(move.to.y, 0, 9)
      ) {
        return false;
      }

      const movingPiece = board[move.from.y]?.[move.from.x] ?? null;
      if (!movingPiece) {
        return false;
      }

      if (movingPiece.color !== turn) {
        return false;
      }

      if (!validateMove(board, move)) {
        return false;
      }

      const nextBoard = cloneBoard(board);
      nextBoard[move.to.y][move.to.x] = movingPiece;
      nextBoard[move.from.y][move.from.x] = null;

      board = nextBoard;
      turn = turn === 'red' ? 'black' : 'red';

      return true;
    },
  };
};
