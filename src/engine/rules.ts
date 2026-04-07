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

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  switch (piece.type) {
    case 'king': {
      if (absDx + absDy !== 1) return false;
      if (!isInPalace(to.x, to.y, piece.color)) return false;
      return true; // We'll implement flying general separately or assume user doesn't strictly need it for MVP, but good practice.
    }
    case 'advisor': {
      if (absDx !== 1 || absDy !== 1) return false;
      if (!isInPalace(to.x, to.y, piece.color)) return false;
      return true;
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
      return true;
    }
    case 'horse': {
      if (!((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1))) return false;
      // Blocking horse leg
      const blockX = from.x + (absDx === 2 ? Math.sign(dx) : 0);
      const blockY = from.y + (absDy === 2 ? Math.sign(dy) : 0);
      if (board[blockY][blockX]) return false;
      return true;
    }
    case 'rook': {
      if (absDx !== 0 && absDy !== 0) return false;
      if (countPiecesBetween(board, from.x, from.y, to.x, to.y) > 0) return false;
      return true;
    }
    case 'cannon': {
      if (absDx !== 0 && absDy !== 0) return false;
      const count = countPiecesBetween(board, from.x, from.y, to.x, to.y);
      if (targetPiece) {
        return count === 1; // Capture requires exact 1 jump
      } else {
        return count === 0; // Move requires 0 jump
      }
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
}
