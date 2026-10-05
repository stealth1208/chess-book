import { createEngine } from '@/engine/engine';
import { Coordinate, Move as EngineMove, PieceType } from '@/engine/types';
import { formatMoveNotation } from '@/features/engine/notation/formatMoveNotation';
import { Move, StoredMove } from '@/features/engine/notation/notation.types';

const FILE_BASE_CODE = 97;
const UCI_RE = /^[a-i][0-9][a-i][0-9]$/;

const squareToCoordinate = (square: string): Coordinate | null => {
  if (!/^[a-i][0-9]$/.test(square)) {
    return null;
  }

  return {
    x: square.charCodeAt(0) - FILE_BASE_CODE,
    y: Number.parseInt(square[1], 10)
  };
};

const coordinateToSquare = (coordinate: Coordinate): string => {
  const file = String.fromCharCode(FILE_BASE_CODE + coordinate.x);
  return `${file}${coordinate.y}`;
};

export const moveToUci = (move: Pick<Move, 'from' | 'to' | 'uci'>): string => {
  return move.uci || `${move.from}${move.to}`;
};

export const parseUciMove = (uci: string): EngineMove | null => {
  if (!UCI_RE.test(uci)) {
    return null;
  }

  const from = squareToCoordinate(uci.slice(0, 2));
  const to = squareToCoordinate(uci.slice(2, 4));

  if (!from || !to) {
    return null;
  }

  return { from, to };
};

const normalizeToEngineMove = (move: StoredMove): EngineMove | null => {
  if (typeof move === 'string') {
    return parseUciMove(move);
  }

  const uci = moveToUci(move);
  return parseUciMove(uci);
};

const getFallbackPiece = (move: StoredMove): PieceType => {
  if (typeof move === 'string') {
    return 'pawn';
  }

  return move.piece;
};

export const normalizeMoves = (initialFen: string, moves: StoredMove[]): Move[] => {
  const engine = createEngine();
  engine.load(initialFen);

  const normalized: Move[] = [];

  moves.forEach((rawMove) => {
    const engineMove = normalizeToEngineMove(rawMove);
    if (!engineMove) {
      return;
    }

    const board = engine.getBoard();
    const movingPiece = board[engineMove.from.y]?.[engineMove.from.x] ?? null;
    const side = movingPiece?.color ?? engine.getTurn();
    const notation = formatMoveNotation(engineMove, board, side);

    const record: Move = {
      from: coordinateToSquare(engineMove.from),
      to: coordinateToSquare(engineMove.to),
      piece: movingPiece?.type ?? getFallbackPiece(rawMove),
      notation,
      side,
      uci: `${coordinateToSquare(engineMove.from)}${coordinateToSquare(engineMove.to)}`
    };

    const ok = engine.applyMoveString(record.uci);
    if (!ok) {
      return;
    }

    normalized.push(record);
  });

  return normalized;
};
