import { BoardState, Move, PieceColor } from "./types";

const isInPalace = (x: number, y: number, color: PieceColor) => {
  if (x < 3 || x > 5) return false;
  if (color === 'red') {
    return y >= 7 && y <= 9;
  } else {
    return y >= 0 && y <= 2;
  }
};

const countPiecesBetween = (board: BoardState, x1: number, y1: number, x2: number, y2: number) => {
  let count = 0;
  if (x1 === x2) {
    const min = Math.min(y1, y2);
    const max = Math.max(y1, y2);
    for (let y = min + 1; y < max; y++) {
      if (board[y][x1]) count++;
    }
  } else if (y1 === y2) {
    const min = Math.min(x1, x2);
    const max = Math.max(x1, x2);
    for (let x = min + 1; x < max; x++) {
      if (board[y1][x]) count++;
    }
  }
  return count;
};

const isPositionAttacked = (
  board: BoardState,
  x: number,
  y: number,
  byColor: PieceColor
): boolean => {
  for (let fromY = 0; fromY < 10; fromY++) {
    for (let fromX = 0; fromX < 9; fromX++) {
      const piece = board[fromY][fromX];
      if (!piece || piece.color !== byColor) continue;

      const dx = x - fromX;
      const dy = y - fromY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      let canAttack = false;

      switch (piece.type) {
        case 'king': {
          if (absDx + absDy === 1 && isInPalace(x, y, piece.color)) {
            canAttack = true;
          }
          break;
        }
        case 'advisor': {
          if (absDx === 1 && absDy === 1 && isInPalace(x, y, piece.color)) {
            canAttack = true;
          }
          break;
        }
        case 'elephant': {
          if (absDx === 2 && absDy === 2) {
            const crossesRiver = piece.color === 'red' ? y < 5 : y > 4;
            if (!crossesRiver) {
              const midX = fromX + dx / 2;
              const midY = fromY + dy / 2;
              if (!board[midY][midX]) {
                canAttack = true;
              }
            }
          }
          break;
        }
        case 'horse': {
          if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) {
            const blockX = fromX + (absDx === 2 ? Math.sign(dx) : 0);
            const blockY = fromY + (absDy === 2 ? Math.sign(dy) : 0);
            if (!board[blockY][blockX]) {
              canAttack = true;
            }
          }
          break;
        }
        case 'rook': {
          if ((absDx === 0 || absDy === 0) && (absDx > 0 || absDy > 0)) {
            if (countPiecesBetween(board, fromX, fromY, x, y) === 0) {
              canAttack = true;
            }
          }
          break;
        }
        case 'cannon': {
          if ((absDx === 0 || absDy === 0) && (absDx > 0 || absDy > 0)) {
            if (countPiecesBetween(board, fromX, fromY, x, y) === 1) {
              canAttack = true;
            }
          }
          break;
        }
        case 'pawn': {
          const dir = piece.color === 'red' ? -1 : 1;
          const hasCrossedRiver = piece.color === 'red' ? fromY <= 4 : fromY >= 5;
          if ((dy === dir && dx === 0) || (hasCrossedRiver && dy === 0 && absDx === 1)) {
            canAttack = true;
          }
          break;
        }
      }

      if (canAttack) {
        return true;
      }
    }
  }

  return false;
};

const checkKingSafety = (board: BoardState, move: Move, movingPieceColor: PieceColor): boolean => {
  const nextBoard: BoardState = board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
  const movingPiece = nextBoard[move.from.y][move.from.x];
  
  nextBoard[move.to.y][move.to.x] = movingPiece;
  nextBoard[move.from.y][move.from.x] = null;

  let ownKingPos: { x: number; y: number } | null = null;

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = nextBoard[y][x];
      if (piece && piece.type === 'king' && piece.color === movingPieceColor) {
        ownKingPos = { x, y };
        break;
      }
    }
    if (ownKingPos) break;
  }

  if (!ownKingPos) {
    return false;
  }

  const opponentColor = movingPieceColor === 'red' ? 'black' : 'red';
  return !isPositionAttacked(nextBoard, ownKingPos.x, ownKingPos.y, opponentColor);
};

const checkFlyingGeneral = (board: BoardState, move: Move): boolean => {
  const nextBoard: BoardState = board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
  const movingPiece = nextBoard[move.from.y][move.from.x];
  
  nextBoard[move.to.y][move.to.x] = movingPiece;
  nextBoard[move.from.y][move.from.x] = null;

  let redKingPos: { x: number; y: number } | null = null;
  let blackKingPos: { x: number; y: number } | null = null;

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = nextBoard[y][x];
      if (piece && piece.type === 'king') {
        if (piece.color === 'red') {
          redKingPos = { x, y };
        } else {
          blackKingPos = { x, y };
        }
      }
    }
  }

  if (!redKingPos || !blackKingPos) {
    return true;
  }

  if (redKingPos.x !== blackKingPos.x) {
    return true;
  }

  const piecesInBetween = countPiecesBetween(
    nextBoard,
    redKingPos.x,
    redKingPos.y,
    blackKingPos.x,
    blackKingPos.y
  );

  return piecesInBetween > 0;
};

export function validateMove(board: BoardState, move: Move): boolean {
  const { from, to } = move;

  const piece = board[from.y]?.[from.x] ?? null;
  if (!piece) return false;
  
  // Boundary check
  if (to.x < 0 || to.x > 8 || to.y < 0 || to.y > 9) return false;
  
  // Same square check
  if (from.x === to.x && from.y === to.y) return false;

  // Friendly fire check
  const targetPiece = board[to.y][to.x];
  if (targetPiece && targetPiece.color === piece.color) return false;

  // Prevent king capture
  if (targetPiece && targetPiece.type === 'king') return false;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  switch (piece.type) {
    case 'king': {
      if (absDx + absDy !== 1) return false;
      if (!isInPalace(to.x, to.y, piece.color)) return false;
      break;
    }
    case 'advisor': {
      if (absDx !== 1 || absDy !== 1) return false;
      if (!isInPalace(to.x, to.y, piece.color)) return false;
      break;
    }
    case 'elephant': {
      if (absDx !== 2 || absDy !== 2) return false;
      // Cannot cross river
      if (piece.color === 'red' && to.y < 5) return false;
      if (piece.color === 'black' && to.y > 4) return false;
      // Eye of elephant block
      const midX = from.x + dx / 2;
      const midY = from.y + dy / 2;
      if (board[midY][midX]) return false;
      break;
    }
    case 'horse': {
      if (!((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1))) return false;
      // Blocking horse leg
      const blockX = from.x + (absDx === 2 ? Math.sign(dx) : 0);
      const blockY = from.y + (absDy === 2 ? Math.sign(dy) : 0);
      if (board[blockY][blockX]) return false;
      break;
    }
    case 'rook': {
      if (absDx !== 0 && absDy !== 0) return false;
      if (countPiecesBetween(board, from.x, from.y, to.x, to.y) > 0) return false;
      break;
    }
    case 'cannon': {
      if (absDx !== 0 && absDy !== 0) return false;
      const count = countPiecesBetween(board, from.x, from.y, to.x, to.y);
      if (targetPiece) {
        if (count !== 1) return false; // Capture requires exact 1 jump
      } else {
        if (count !== 0) return false; // Move requires 0 jump
      }
      break;
    }
    case 'pawn': {
      const isRed = piece.color === 'red';
      const dir = isRed ? -1 : 1;
      const hasCrossedRiver = isRed ? from.y <= 4 : from.y >= 5;

      if (dy === dir && dx === 0) return true; // Forward 1
      if (hasCrossedRiver && dy === 0 && absDx === 1) return true; // Sideways 1
      
      return false;
    }
  }

  if (!checkFlyingGeneral(board, move)) {
    return false;
  }

  if (!checkKingSafety(board, move, piece.color)) {
    return false;
  }

  return true;
}
