# Data Model: Xiangqi Study App Phase 1 (Revised)

## 1) Folder

- Purpose: Organize variations in a hierarchical tree. **Purely organizational — no semantic relationship between variations based on folder placement.**
- Fields:
  - id: string (UUID)
  - name: string
  - parentId: string | null
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Constraints:
  - `name` is required, trimmed, length 1..80
  - `parentId` must reference an existing folder or be null
  - No cyclic ancestry allowed
  - **Delete blocked** if folder has direct children (folders or variations); must empty before delete
- Relationships:
  - One folder → many child folders (by `parentId`)
  - One folder → many variations (direct children only; no recursive inclusion)

## 2) Variation

- Purpose: Store replayable opening lines with deterministic replay from FEN + moves.
- Fields:
  - id: string (UUID)
  - folderId: string | null
  - name: string
  - initialFen: string
  - moves: string[] (e.g., `["a0a1", "h9g7", ...]`)
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Constraints:
  - `name` required, length 1..120
  - `initialFen` must be parseable as valid Xiangqi FEN
  - Each `moves[i]` matches `^[a-i][0-9][a-i][0-9]$` (coordinate format)
  - `folderId` references existing folder or null
  - No validation engine: accept all move input; replay deterministically via `applyMove()`
- Relationships:
  - Many variations → one folder (optional)

## 2.1) VariationDraft (UI transient, Phase 1 only)

- Purpose: Shared intermediate state for both variation-creation entry points (notation confirm + move-list save).
- Fields:
  - name: string
  - initialFen: string
  - moves: string[]
  - folderId: string | null (optional folder for new variation)
  - source: "notation-confirm" | "movelist-save"
- Rules:
  - Both entry points generate semantically equivalent draft payload for the same board state
  - Draft persists as Variation entity on confirm
  - `source` field is analytics-only; not persisted in final Variation

## 2.2) VariationDetailModalState (UI transient, Phase 1 only)

- Purpose: Drive variation edit/delete modal UI behavior.
- Fields:
  - variationId: string
  - isOpen: boolean
  - mode: "view" | "edit"
  - pendingName: string (for edit input)
- State machine:
  - `closed → open(view)` on TopicView edit-icon click
  - `open(view) → open(edit)` on "rename" action
  - `open(*) → closed` on cancel, confirm, or delete success

## 3) BoardState (UI transient, shared between Analysis and Library)

- Purpose: Current board position, move history, and navigation state during a session.
- Fields:
  - variationId: string | null (currently loaded variation)
  - initialFen: string
  - moves: string[] (replayed moves from variation)
  - currentMoveIndex: number (0..moves.length; 0 = initial position)
  - interactive: boolean (true in Analysis; false in Library)
- Behavior:
  - Select variation in Analysis or Library → load variation's initialFen + moves → reset currentMoveIndex to `moves.length`
  - Click a move in transcript → jump to that index
  - In Analysis: drag piece → validate (if rules ready) → apply move → append to moves
  - In Library: click/drag piece → ignore (read-only mode)
  - Undo/Redo only available in Analysis (`interactive=true`)

## 4) MoveRecord (engine value object)

- Purpose: Normalized in-memory shape for move display and validation.
- Fields:
  - from: { x: number, y: number }
  - to: { x: number, y: number }
  - pieceType: "king" | "advisor" | "elephant" | "horse" | "rook" | "cannon" | "pawn"
  - color: "red" | "black"
- Constraints:
  - Coordinates within board bounds (x: 0..8, y: 0..9)

## Deferred Entities (Phase 2+)

The following entities are **out of scope** for Phase 1:

- **PracticeAttempt**: Practice mode deferred to Phase 3+
- **MigrationJob**: Auth and user-mode sync deferred to Phase 3+
- **Validation models**: Validation engine deferred to Phase 2+

## Indexing and Query Strategy

**Local Storage** (guest mode, Phase 1):

- Folders: sorted by `parentId`, then `name`
- Variations: sorted by `folderId`, then `updatedAt` (descending)
- Query helpers in `useGameStore()`:
  - `foldersByParentId(parentId)` → Folder[]
  - `variationsByFolderId(folderId)` → Variation[]
  - `getFolder(id)` → Folder | undefined
  - `getVariation(id)` → Variation | undefined

## Constraints from Phase 1 Scope

- **No validation engine**: Accept all moves without rule enforcement; replay deterministically via `applyMove()`
- **No Auth**: All data is ephemeral to session; no userId field in Phase 1 entities
- **No Practice**: PracticeAttempt deferred; scoring/attempt history not tracked
- **No Mindmap**: Derived view deferred; no mindmap-specific data structures needed
- **Unified Board**: Single BoardState instance shared between Analysis and Library via `interactive` prop
