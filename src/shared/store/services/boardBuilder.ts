import { createEngine } from '@/engine/engine';
import { BoardState } from '@/engine/types';
import { moveToUci } from '@/features/engine/notation/moveRecord';
import { Move, StoredMove } from '@/features/engine/notation/notation.types';

const asUciMove = (move: StoredMove | Move): string => {
  if (typeof move === 'string') {
    return move;
  }

  return moveToUci(move);
};

export const buildBoards = (initialFen: string, moves: Array<StoredMove | Move>): BoardState[] => {
  const engine = createEngine();
  engine.load(initialFen);

  const boards: BoardState[] = [engine.getBoard()];

  moves.forEach((move, index) => {
    const moveString = asUciMove(move);
    const ok = engine.applyMoveString(moveString);

    if (!ok) {
      throw new Error(`Invalid move at ply ${index + 1}: ${moveString}`);
    }

    boards.push(engine.getBoard());
  });

  return boards;
};
