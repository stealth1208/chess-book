import { createEngine } from '@/engine/engine';
import { BoardState, PieceColor, PieceType } from '@/engine/types';
import { DIAGONAL_FILE_PIECES, PIECE_SYMBOLS } from './notation.constants';

type ParsedMove = {
  piece: PieceType;
  side: PieceColor;
  fromFile: number;
  operator: '-' | '.' | '+';
  destination: number;
};

const reversePieceSymbols: Record<string, { type: PieceType; side: PieceColor }> = {};
Object.entries(PIECE_SYMBOLS).forEach(([side, pieces]) => {
  Object.entries(pieces).forEach(([pieceType, symbol]) => {
    reversePieceSymbols[symbol] = {
      type: pieceType as PieceType,
      side: side as PieceColor,
    };
  });
});

const parseVietnameseMove = (moveStr: string): ParsedMove | null => {
  const trimmed = moveStr.trim();
  if (trimmed.length < 4) {
    return null;
  }

  let pieceSymbol: string;
  let rest: string;

  if (trimmed.startsWith('Tg') || trimmed.startsWith('tg')) {
    pieceSymbol = trimmed.slice(0, 2);
    rest = trimmed.slice(2);
  } else {
    pieceSymbol = trimmed[0];
    rest = trimmed.slice(1);
  }

  const pieceInfo = reversePieceSymbols[pieceSymbol];
  if (!pieceInfo) {
    return null;
  }

  const operatorMatch = rest.match(/^(\d+)([-+.])(\d+)$/);
  if (!operatorMatch) {
    return null;
  }

  const fromFile = parseInt(operatorMatch[1], 10);
  const operator = operatorMatch[2] as '-' | '.' | '+';
  const destination = parseInt(operatorMatch[3], 10);

  if (fromFile < 1 || fromFile > 9 || destination < 1 || destination > 9) {
    return null;
  }

  return {
    piece: pieceInfo.type,
    side: pieceInfo.side,
    fromFile,
    operator,
    destination,
  };
};

const convertToUci = (
  parsed: ParsedMove,
  board: BoardState
): string | null => {
  const fromX = parsed.side === 'red' ? 9 - parsed.fromFile : parsed.fromFile - 1;

  let fromY = -1;
  for (let y = 0; y < 10; y++) {
    const piece = board[y]?.[fromX];
    if (piece && piece.type === parsed.piece && piece.color === parsed.side) {
      fromY = y;
      break;
    }
  }

  if (fromY === -1) {
    return null;
  }

  let toX: number;
  let toY: number;

  if (parsed.operator === '-') {
    toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
    toY = fromY;
  } else if (parsed.operator === '.') {
    if (DIAGONAL_FILE_PIECES.includes(parsed.piece)) {
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      toY = parsed.side === 'red' ? fromY - Math.abs(toX - fromX) : fromY + Math.abs(toX - fromX);
    } else {
      toX = fromX;
      toY = parsed.side === 'red' ? fromY - parsed.destination : fromY + parsed.destination;
    }
  } else {
    if (DIAGONAL_FILE_PIECES.includes(parsed.piece)) {
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      toY = parsed.side === 'red' ? fromY + Math.abs(toX - fromX) : fromY - Math.abs(toX - fromX);
    } else {
      toX = fromX;
      toY = parsed.side === 'red' ? fromY + parsed.destination : fromY - parsed.destination;
    }
  }

  if (toX < 0 || toX > 8 || toY < 0 || toY > 9) {
    return null;
  }

  const fromFile = String.fromCharCode(97 + fromX);
  const toFile = String.fromCharCode(97 + toX);
  
  return `${fromFile}${fromY}${toFile}${toY}`;
};

export const parseVietnameseNotation = (
  notation: string,
  initialFen: string = ''
): string[] | { error: string } => {
  const engine = createEngine();
  engine.load(initialFen);

  const lines = notation.trim().split('\n');
  const uciMoves: string[] = [];

  for (const line of lines) {
    const moveMatches = line.matchAll(/((?:Tg|tg|[A-Za-z])\d+[-+.]\d+)/g);
    
    for (const match of moveMatches) {
      const moveStr = match[1];
      const parsed = parseVietnameseMove(moveStr);
      
      if (!parsed) {
        return { error: `Invalid move notation: ${moveStr}` };
      }

      const expectedSide = engine.getTurn();
      if (parsed.side !== expectedSide) {
        return { error: `Move side mismatch at "${moveStr}": expected ${expectedSide}, got ${parsed.side}` };
      }

      const board = engine.getBoard();
      const uci = convertToUci(parsed, board);
      
      if (!uci) {
        return { error: `Could not find piece for move: ${moveStr}` };
      }

      const success = engine.applyMoveString(uci);
      if (!success) {
        return { error: `Illegal move: ${moveStr} (UCI: ${uci})` };
      }

      uciMoves.push(uci);
    }
  }

  return uciMoves;
};
