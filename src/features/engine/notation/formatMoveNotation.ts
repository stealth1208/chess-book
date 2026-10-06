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

  // Check if there are other pieces of the same type on the same file
  let disambiguator = '';
  const sameFilePieces: number[] = [];
  
  for (let y = 0; y < 10; y++) {
    const piece = boardState[y]?.[move.from.x];
    if (piece && piece.type === movingPiece.type && piece.color === movingPiece.color) {
      sameFilePieces.push(y);
    }
  }

  // If there are multiple pieces of the same type on the same file, add disambiguator
  if (sameFilePieces.length > 1) {
    // For red: trước (t) = smaller y (closer to top), sau (s) = larger y (closer to bottom)
    // For black: trước (t) = larger y (closer to bottom), sau (s) = smaller y (closer to top)
    const isFront = pieceSide === 'red' 
      ? move.from.y === Math.min(...sameFilePieces)
      : move.from.y === Math.max(...sameFilePieces);
    
    disambiguator = isFront ? 't' : 's';
  }

  return `${pieceSymbol}${disambiguator}${fromFile}${operator}${destination}`;
};
