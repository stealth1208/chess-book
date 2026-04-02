# Data Model: Xiangqi Study App Phase 1

## 1) Folder

- Purpose: Organize variations in a hierarchical tree. **Purely organizational — no semantic relationship between variations based on folder placement.**
- Fields:
  - id: string (UUID)
  - userId: string | null (null for local guest data before migration)
  - name: string
  - parentId: string | null
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Validation rules:
  - `name` is required, trimmed, length 1..80
  - `parentId` must reference an existing folder or be null
  - No cyclic ancestry allowed
- Delete constraint: **Blocked** if the folder has any direct child folders or any variations with `folderId === this.id`. User must empty the folder before deleting it.
- Relationships:
  - One folder has many child folders (parent-child by `parentId`)
  - One folder has many variations (direct children only — `folderId === folder.id`; no recursive traversal implied)

## 2) Variation

- Purpose: Store replayable opening lines.
- Fields:
  - id: string (UUID)
  - userId: string | null
  - folderId: string | null
  - name: string
  - initialFen: string
  - moves: string[]
  - createdAt: string (ISO timestamp)
  - updatedAt: string (ISO timestamp)
- Validation rules:
  - `name` is required, length 1..120
  - `initialFen` must parse as valid Xiangqi FEN
  - Each `moves[i]` must match coordinate format `^[a-i][0-9][a-i][0-9]$`
  - `folderId` must reference existing folder or be null
- Relationships:
  - Many variations belong to one folder (optional)

## 3) PracticeAttempt (ephemeral/session)

- Purpose: Track current practice run against one variation.
- Fields:
  - variationId: string
  - expectedMoves: string[]
  - currentIndex: number
  - correctCount: number
  - wrongCount: number
  - startedAt: string
  - finishedAt: string | null
- Validation rules:
  - `currentIndex` range: 0..expectedMoves.length
  - `correctCount + wrongCount` >= currentIndex
- State transitions:
  - `idle -> active` on start practice
  - `active -> active` on correct move (index +1, correctCount +1)
  - `active -> active` on wrong move (wrongCount +1, correct move highlighted on board, then index +1 — no board reset, no return to start)
  - `active -> completed` when currentIndex == expectedMoves.length

## 4) MoveRecord (engine-level value object)

- Purpose: Normalized in-memory move shape used by replay list and board actions.
- Fields:
  - from: { x: number, y: number }
  - to: { x: number, y: number }
  - pieceType: "king" | "advisor" | "elephant" | "horse" | "rook" | "cannon" | "pawn"
  - color: "red" | "black"
- Validation rules:
  - Coordinates remain inside board bounds (x: 0..8, y: 0..9)

## 5) MigrationJob (one-time logical process)

- Purpose: Capture local-to-cloud sync status on first sign-in.
- Fields:
  - userId: string
  - localFolderCount: number
  - localVariationCount: number
  - migratedAt: string
  - status: "success" | "partial" | "failed"
- Rules:
  - Triggered once on first authenticated session where local data exists
  - Success writes remote records and clears/marks local cache as migrated

## Indexing and Query Notes

- Folders: index by (userId, parentId)
- Variations: index by (userId, folderId), (userId, updatedAt desc)
- For local cache, maintain sorted query helpers equivalent to above indices
