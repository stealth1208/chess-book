import { PieceType, PieceColor } from '@/engine/types';

export type Side = PieceColor;

export type Move = {
  from: string;
  to: string;
  piece: PieceType;
  notation: string;
  side: Side;
  uci: string;
};

export type LegacyMove = string;

export type StoredMove = Move | LegacyMove;
