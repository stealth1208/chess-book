# Contract: Unified Board Component (Analysis + Library)

**Location**: `src/shared/components/Board/Board.tsx`  
**Status**: Phase 1 Design  
**Principle**: Single component, dual mode (interactive Analysis vs. read-only Library)

## Overview

The Board component serves two screens with different interactivity levels:

- **Analysis**: `interactive={true}` — Allows piece drag, move validation, undo/redo, navigation
- **Library**: `interactive={false}` — Display-only, shows pieces and move transcript, no interaction

This contract defines the component's props, behavior contracts, and render boundaries for both modes.

Companion shared topic component:

- `TopicView` (renamed from `TopicTreeView`)
- Location: `src/features/TopicView/TopicView.tsx` (data-connected; not shared infrastructure)

---

## Component Signature

```typescript
type BoardProps = {
  // Data
  variationId: string | null;
  initialFen: string;
  moves: string[];
  currentMoveIndex: number; // 0..moves.length

  // Behavior mode
  interactive: boolean; // true=Analysis, false=Library

  // Callbacks (only wired in interactive mode)
  onMoveApplied?: (move: string) => void;
  onUndoRequested?: () => void;
  onRedoRequested?: () => void;
  onMoveSelected?: (moveIndex: number) => void;
};

export const Board: React.FC<BoardProps> = ({
  variationId,
  initialFen,
  moves,
  currentMoveIndex,
  interactive,
  onMoveApplied,
  onUndoRequested,
  onRedoRequested,
  onMoveSelected,
}) => {
  // ... implementation
};
```

---

## Behavior Contract

### Display (Both Modes)

**Board Rendering**:

- Parse `initialFen`, apply `moves[0]..moves[currentMoveIndex]`
- Render board grid (9×10 with rank/file labels)
- Render all pieces at correct positions
- Highlight current move endpoints (if `currentMoveIndex > 0`)
- Show move transcript (numbered list of moves with `currentMoveIndex` highlighted)

**Move Transcript**:

- Display all moves in order: `1. a0a1 (Red) b0c2 (Black) ...`
- Highlight current move index (underline or background color)
- Display count: `Move {currentMoveIndex + 1} of {moves.length}`

### Interactive Mode (`interactive={true` — Analysis)

**Piece Interaction**:

- Allow drag-and-drop on pieces of the current player
- Show legal moves on hover (highlight destination squares)
- On valid drop: emit `onMoveApplied(move)`; component does **not** update state (parent updates)
- On invalid drop: visual feedback (pulse/shake), no callback

**Move Navigation**:

- Undo button enabled if `currentMoveIndex > 0`; on click, emit `onUndoRequested()`
- Redo button enabled if `currentMoveIndex < moves.length`; on click, emit `onRedoRequested()`
- On move transcript click: emit `onMoveSelected(moveIndex)`

**Control Buttons Visible**:

- Undo/Redo buttons
- Move list header (count/navigation)
- **Not present**: Save, Delete, or other persistence actions

### Read-Only Mode (`interactive={false}` — Library)

**Piece Interaction**:

- All pieces rendered
- Click/drag on pieces: **ignored** (no cursor change, no visual feedback, no callback)
- Pieces display as static (no hover effects, no drag cursor)

**Move Transcript**:

- Display all moves (read-only)
- Click on move: **ignored** (no jump-to-move in Library)

**Control Buttons**:

- Undo/Redo buttons: **hidden** or disabled
- Move navigation: **disabled**
- **Result**: Board is display-only; focus remains on the variation view UI (folder tree, selection)

---

## State Management

**Props update → Board re-renders**:

- Parent (Analysis or Library screen) owns `variationId`, `moves`, `currentMoveIndex` state
- Parent updates via `useGameStore()` mutations
- Board receives new props → recalculates board position → re-renders

**Example flow (Analysis)**:

1. Parent renders: `<Board interactive={true} variationId="var-1" moves={[...]} currentMoveIndex={3} />`
2. User drags piece
3. Board emits `onMoveApplied("d0d1")`
4. Parent calls `useGameStore().applyMove("d0d1")`
5. Zustand updates `moves` and `currentMoveIndex`
6. Parent re-renders Board with new props
7. Board updates display

---

## Error Boundaries

**Invalid FEN**:

- Board renders empty board (9×10 grid, no pieces)
- No error message displayed (parent responsible for validation feedback)

**Invalid Move Index**:

- If `currentMoveIndex > moves.length`, clamp to `moves.length`
- If `currentMoveIndex < 0`, clamp to `0`

**Missing Variation**:

- If `variationId=null` and/or `initialFen=""`
- Render empty board state (no error UI; parent shows "select a variation" messaging)

---

## Props Update Examples

### Example 1: User Selects Different Variation in Library

```typescript
// Before: Library loaded Variation A
<Board
  variationId="var-A"
  initialFen="rnbakabnr/9/1c5c1/..."
  moves={["a0a1", "b0c2"]}
  currentMoveIndex={2}
  interactive={false}
/>

// User clicks Variation B in tree
// Parent updates store
// After: Library shows Variation B
<Board
  variationId="var-B"
  initialFen="rnbakabnr/9/1c5c1/..."
  moves={["h9g7", "i9h7", "h7h9"]}
  currentMoveIndex={3}
  interactive={false}
/>
```

### Example 2: Tab Switch from Analysis to Library (Same Variation)

```typescript
// Analysis tab loaded Variation A, user moved to index 3
<Board
  variationId="var-A"
  initialFen="..."
  moves={[...]} // Full moveset
  currentMoveIndex={3}
  interactive={true}
  onMoveApplied={...}
/>

// User clicks Library tab
// Library loads same variation
// Board mode changes to read-only
<Board
  variationId="var-A"
  initialFen="..."
  moves={[...]} // Same moveset
  currentMoveIndex={3}  // Board keeps same position
  interactive={false}   // No interaction allowed
/>

// User switches back to Analysis tab
// Analysis restores board state
<Board
  variationId="var-A"
  initialFen="..."
  moves={[...]}
  currentMoveIndex={3}  // Persisted from earlier
  interactive={true}
  onMoveApplied={...}
/>
```

---

## Testing Strategy

**Manual Validation** (per quickstart.md):

- [ ] **Analysis interactive mode**: Drag piece, confirm move applies; click undo, confirm index decreases
- [ ] **Library read-only mode**: Try clicking/dragging piece; confirm no movement, no UI feedback
- [ ] **Tab switch with state persistence**: Move to index 3 in Analysis, switch to Library, return to Analysis; confirm index still 3
- [ ] **Error handling**: Delete all moves, confirm board shows initial FEN only; reload variation, confirm full moveset replays

---

## Constitutional Alignment

- **Principle 3** (Single-Intent Controls): Board control buttons exclude persistence actions ✓
- **Principle 5** (Deterministic Hydration): Board calculation is pure (FEN + moves array); no async dependencies ✓
