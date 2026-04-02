# Research: Xiangqi Study App Phase 1

## Decision 1: Keep a deterministic move notation contract

- Decision: Use fixed coordinate move notation `a0a1` style (4 chars) as canonical storage format in `moves[]`.
- Rationale: Compact, serializable, and engine-agnostic; avoids locale-dependent notation.
- Alternatives considered: Human-readable Vietnamese notation only; storing full board snapshot after each move.

## Decision 2: Treat `initialFen + moves[]` as the single source of truth

- Decision: Persist variations as `initialFen` plus ordered move list and reconstruct board state by replay.
- Rationale: Matches spec principles, enables undo/redo/jump naturally, and keeps payload small.
- Alternatives considered: Persist final board only; persist every intermediate board state.

## Decision 3: Guest persistence via IndexedDB abstraction

- Decision: Use `localforage` for guest storage with folder/variation collections.
- Rationale: Reliable async browser storage with larger capacity than localStorage and simple API.
- Alternatives considered: localStorage (sync and size-limited), custom IndexedDB wrapper.

## Decision 4: Authenticated persistence via Supabase tables

- Decision: Store `folders` and `variations` in Supabase PostgreSQL with row ownership by `user_id`.
- Rationale: Managed auth + Postgres aligns with product requirements and sync roadmap.
- Alternatives considered: Firebase Firestore, self-hosted REST API.

## Decision 5: First-signin auto migration behavior

- Decision: On first successful auth, auto-upload all local guest data to user account with no confirmation dialog.
- Rationale: Explicit clarification from spec session and best UX for retaining study progress.
- Alternatives considered: Prompt-based merge, server-wins overwrite.

## Decision 6: Test stack for Phase 1 reliability

- Decision: Add Vitest + React Testing Library for unit/component tests, and Playwright for essential end-to-end flows.
- Rationale: Fast feedback for engine/store logic plus confidence on key user flows (save/load/replay).
- Alternatives considered: Jest only; no E2E in MVP.

## Decision 7: Mindmap generation strategy

- Decision: Derive mindmap view model directly from variation/folder graph at render/query time (with memoization), view-only in Phase 1.
- Rationale: Avoids duplicate persisted state and keeps source of truth unified.
- Alternatives considered: Separate persisted mindmap table, manual node editing.

## Decision 8: Phase 1 scope boundaries

- Decision: Exclude checkmate detection, AI evaluation, and drag-drop folder operations from implementation.
- Rationale: Keeps MVP delivery focused and consistent with stated constraints.
- Alternatives considered: Partial AI hints, advanced move legality extensions.

## Decision 9: Folder tree is purely organizational

- Decision: Folders carry no semantic meaning for the variations they contain. A variation in a child folder does NOT inherit from, extend, or depend on any variation in a parent folder.
- Rationale: Explicit clarification from product owner. Simplifies tree traversal (no recursive logic needed), variation loading (direct folderId filter only), and mindmap edges (containment-only).
- Alternatives considered: Parent folder implies opening "theme" inherited by child variations (rejected — over-engineering for Phase 1).

## Decision 10: Folder delete requires empty folder (block policy)

- Decision: Deleting a folder is blocked if it contains any direct variations or any direct child folders. UI must surface a clear warning; user must empty the folder manually before deleting.
- Rationale: Prevents accidental data loss without silent cascade deletes; consistent with the "purely organizational" nature of folders (variations have no dependency on the folder container).
- Alternatives considered: Cascade delete all contents (too destructive by default); soft-orphan variations to root on delete (breaks user's deliberate organization without warning).

## Decision 11: Folder variation loading is direct children only

- Decision: Clicking a folder shows only variations where `folderId === selectedFolderId`. No recursive traversal into child folders.
- Rationale: Consistent with direct folderId ownership model and the purely organizational folder contract. User navigates explicitly.
- Alternatives considered: Show all descendant variations when clicking a parent (rejected — blurs folder boundaries and complicates filter logic).

## Decision 12: Practice wrong-move behavior is highlight-and-advance

- Decision: On a wrong move, the correct move is visually highlighted on the board, then `currentIndex` advances by 1. No board reset to move 0, no penalty beyond incrementing the wrong counter.
- Rationale: Explicit product owner clarification (Option C). Keeps practice flowing without frustration loops; wrong count still provides accuracy feedback.
- Alternatives considered: Full reset to move 0 (too punishing for early learners); retry-in-place with no advance (can loop forever); show correct then reset (inconsistent with Option C).

## Decision 13: Mindmap edges are containment-only

- Decision: Mindmap edges connect folder → child folder and folder → variation only. No edges between sibling variations or across unrelated folders.
- Rationale: Explicit product owner clarification (Option A). Mirrors the folder tree structure exactly; avoids implying game-play relationships that don't exist (consistent with Decision 9).
- Alternatives considered: No edges at all (loses folder hierarchy structure); user-defined edges (out of scope for Phase 1 view-only mindmap).

## Clarification Resolution Summary

All previously unresolved technical context items are resolved in this document:

- Testing approach selected
- Storage split and migration policy finalized
- Contract surface for move and variation persistence defined
- Scope and performance boundaries pinned for Phase 1
- Folder semantics, delete policy, variation loading scope, practice wrong-move behavior, and mindmap edge model all resolved via product owner clarification session (2026-04-01)
