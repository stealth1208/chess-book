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

## Clarification Resolution Summary

All previously unresolved technical context items are resolved in this document:

- Testing approach selected
- Storage split and migration policy finalized
- Contract surface for move and variation persistence defined
- Scope and performance boundaries pinned for Phase 1
