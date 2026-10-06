import { createEngine } from '@/engine/engine';
import { BoardState, PieceColor, PieceType } from '@/engine/types';
import { DIAGONAL_FILE_PIECES, PIECE_SYMBOLS } from './notation.constants';

type ParsedMove = {
  piece: PieceType;
  side: PieceColor;
  fromFile: number;
  operator: '-' | '.' | '+';
  destination: number;
  disambiguator?: 't' | 's'; // trước (front) / sau (back)
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
  let disambiguator: 't' | 's' | undefined;

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

  // Check for trước/sau disambiguator (must come before the file number)
  if (rest.startsWith('t') || rest.startsWith('s')) {
    disambiguator = rest[0] as 't' | 's';
    rest = rest.slice(1);
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
    disambiguator,
  };
};

const convertToUci = (
  parsed: ParsedMove,
  board: BoardState
): string | null => {
  const fromX = parsed.side === 'red' ? 9 - parsed.fromFile : parsed.fromFile - 1;

  // Find all pieces of the same type and color on the same file
  const candidateYs: number[] = [];
  for (let y = 0; y < 10; y++) {
    const piece = board[y]?.[fromX];
    if (piece && piece.type === parsed.piece && piece.color === parsed.side) {
      candidateYs.push(y);
    }
  }

  if (candidateYs.length === 0) {
    return null;
  }

  let fromY = -1;
  
  if (candidateYs.length === 1) {
    fromY = candidateYs[0];
  } else {
    // Multiple pieces on the same file - use disambiguator
    // For red: trước (t) = smaller y (closer to top), sau (s) = larger y (closer to bottom)
    // For black: trước (t) = larger y (closer to bottom), sau (s) = smaller y (closer to top)
    if (parsed.disambiguator === 't') {
      fromY = parsed.side === 'red' ? Math.min(...candidateYs) : Math.max(...candidateYs);
    } else if (parsed.disambiguator === 's') {
      fromY = parsed.side === 'red' ? Math.max(...candidateYs) : Math.min(...candidateYs);
    } else {
      // No disambiguator provided - use the first one found (default behavior)
      fromY = candidateYs[0];
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
    if (parsed.piece === 'horse') {
      // Horse moves in an L-shape: 2 squares in one direction, 1 square perpendicular
      // The destination number indicates the target file
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      const dx = Math.abs(toX - fromX);
      
      // For horse, if dx=1, then dy=2; if dx=2, then dy=1
      if (dx === 1) {
        toY = parsed.side === 'red' ? fromY - 2 : fromY + 2;
      } else if (dx === 2) {
        toY = parsed.side === 'red' ? fromY - 1 : fromY + 1;
      } else {
        return null;
      }
    } else if (DIAGONAL_FILE_PIECES.includes(parsed.piece)) {
      // Elephant and advisor move diagonally
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      toY = parsed.side === 'red' ? fromY - Math.abs(toX - fromX) : fromY + Math.abs(toX - fromX);
    } else {
      // Vertical forward move (pawn, rook, cannon, king)
      toX = fromX;
      toY = parsed.side === 'red' ? fromY - parsed.destination : fromY + parsed.destination;
    }
  } else {
    // '+' operator - backward movement
    if (parsed.piece === 'horse') {
      // Horse moves in an L-shape backwards
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      const dx = Math.abs(toX - fromX);
      
      if (dx === 1) {
        toY = parsed.side === 'red' ? fromY + 2 : fromY - 2;
      } else if (dx === 2) {
        toY = parsed.side === 'red' ? fromY + 1 : fromY - 1;
      } else {
        return null;
      }
    } else if (DIAGONAL_FILE_PIECES.includes(parsed.piece)) {
      // Diagonal backward move
      toX = parsed.side === 'red' ? 9 - parsed.destination : parsed.destination - 1;
      toY = parsed.side === 'red' ? fromY + Math.abs(toX - fromX) : fromY - Math.abs(toX - fromX);
    } else {
      // Vertical backward move
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
    const moveMatches = line.matchAll(/((?:Tg|tg|[A-Za-z])[ts]?\d+[-+.]\d+)/g);
    
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
