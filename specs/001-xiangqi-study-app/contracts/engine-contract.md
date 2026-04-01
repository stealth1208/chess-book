# Contract: Engine and Practice Evaluation

## Engine Module Boundary

Engine stays UI-independent and exposes deterministic pure functions where possible.

## Core Interfaces

```ts
export type Coord = { x: number; y: number };

export type Piece = {
  type: "king" | "advisor" | "elephant" | "horse" | "rook" | "cannon" | "pawn";
  color: "red" | "black";
};

export type Move = {
  from: Coord;
  to: Coord;
  piece: Piece;
};
```

## Required Function Contracts

```ts
parseFEN(fen: string): BoardState
formatMove(move: Move): string
applyMove(board: BoardState, move: Move): BoardState
validateMove(board: BoardState, move: Move): boolean
```

## Behavior Rules

- `validateMove` must support rook, horse, cannon, pawn in Phase 1.
- `applyMove` assumes validated input; invalid calls return controlled error or unchanged state by implementation policy.
- `undo`, `redo`, and `jumpToMove(index)` are state-layer contracts over replay history.

## Practice Evaluation Contract

```ts
checkPracticeMove(userMove: string, expectedMove: string): "correct" | "wrong"
```

- Input format: canonical coordinate notation.
- Correct: advance index by 1.
- Wrong: keep index unchanged and trigger configured reset behavior.

## Non-goals (Phase 1)

- Checkmate detection
- AI search/evaluation
- Tactical score computation
