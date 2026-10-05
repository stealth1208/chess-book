import { PieceType } from '@/engine/types';
import { Side } from '@/features/engine/notation/notation.types';

export const PIECE_SYMBOLS: Record<Side, Record<PieceType, string>> = {
  red: {
    rook: 'X',
    horse: 'M',
    elephant: 'T',
    advisor: 'S',
    king: 'Tg',
    cannon: 'P',
    pawn: 'B',
  },
  black: {
    rook: 'x',
    horse: 'm',
    elephant: 't',
    advisor: 's',
    king: 'tg',
    cannon: 'p',
    pawn: 'b',
  },
};

export const DIAGONAL_FILE_PIECES: PieceType[] = ['horse', 'elephant', 'advisor'];
