import { createEngine } from '@/engine/engine';
import { BoardState } from '@/engine/types';

export const buildBoards = (initialFen: string, moves: string[]): BoardState[] => {
  const engine = createEngine();
  engine.load(initialFen);

  const boards: BoardState[] = [engine.getBoard()];

  moves.forEach((move, index) => {
    const ok = engine.applyMoveString(move);

    if (!ok) {
      throw new Error(`Invalid move at ply ${index + 1}: ${move}`);
    }

    boards.push(engine.getBoard());
  });

  return boards;
};
