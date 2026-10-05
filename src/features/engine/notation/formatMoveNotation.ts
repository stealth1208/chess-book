import { BoardState, Move as EngineMove, PieceType } from '@/engine/types';
import { DIAGONAL_FILE_PIECES, PIECE_SYMBOLS } from '@/features/engine/notation/notation.constants';
import { Side } from '@/features/engine/notation/notation.types';

const getFileFromSide = (x: number, side: Side): number => {
  return side === 'red' ? 9 - x : x + 1;
};

const getDestinationPart = (piece: PieceType, move: EngineMove, side: Side): string => {
  const isHorizontal = move.from.y === move.to.y;
  const isDiagonal = move.from.x !== move.to.x && move.from.y !== move.to.y;

  if (isHorizontal) {
    return String(getFileFromSide(move.to.x, side));
  }

  if (DIAGONAL_FILE_PIECES.includes(piece) || isDiagonal) {
    return String(getFileFromSide(move.to.x, side));
  }

  return String(Math.abs(move.to.y - move.from.y));
};

const getOperator = (move: EngineMove, side: Side): string => {
  const isHorizontal = move.from.y === move.to.y;
  if (isHorizontal) {
    return '-';
  }

  const isForward = side === 'red'
    ? move.to.y < move.from.y
    : move.to.y > move.from.y;

  return isForward ? '.' : '+';
};

export const formatMoveNotation = (
  move: EngineMove,
  boardState: BoardState,
  side: Side
): string => {
  const movingPiece = boardState[move.from.y]?.[move.from.x] ?? null;

  if (!movingPiece) {
    return '';
  }

  const pieceSide = movingPiece.color;
  const notationSide = side ?? pieceSide;
  const fromFile = getFileFromSide(move.from.x, notationSide);
  const pieceSymbol = PIECE_SYMBOLS[pieceSide][movingPiece.type];
  const operator = getOperator(move, notationSide);
  const destination = getDestinationPart(movingPiece.type, move, notationSide);

  return `${pieceSymbol}${fromFile}${operator}${destination}`;
};
