# Quickstart: Xiangqi Study App Phase 1 (Revised)

## Feature Docs Index

- Spec: `specs/001-xiangqi-study-app/spec.md`
- Plan: `specs/001-xiangqi-study-app/plan.md`
- Research: `specs/001-xiangqi-study-app/research.md`
- Data model: `specs/001-xiangqi-study-app/data-model.md`
- Contracts: `specs/001-xiangqi-study-app/contracts/`
- Tasks: `specs/001-xiangqi-study-app/tasks.md` (generated Phase 2)

## Prerequisites

- Node.js 20+
- npm 10+

## Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Phase 1 Screens to Verify

**In Scope**:

- **Analysis page**: Variation CRUD-first layout, TopicView above notation input, board interaction, undo/redo, move transcript
- **Library page**: Folder tree browsing, variation selection, read-only board view

**Out of Scope (Phase 3+)**:

- Practice mode (deferred)
- Mindmap view (deferred)
- Auth/user-mode sync (deferred)
- Validation engine (deferred to Phase 2)

## Data Setup

- Guest mode only: all data persists to localforage (browser IndexedDB)
- No server sync, no Auth login in Phase 1
- Variation replay is deterministic from `initialFen + moves[]` without validation

## Test Commands

```bash
npm run lint          # Must pass with 0 errors before Phase 2
npm run test          # Placeholder; not yet implemented
npm run test:e2e      # Placeholder; not yet implemented
```

## Manual Validation Checklist for Phase 1

### Landing Page & Hydration

- [ ] Hard-refresh landing page; confirm no blank screen
- [ ] Check that TopicView renders on landing page
- [ ] Confirm no "stuck loading" state on initial load

### Analysis Page

- [ ] Load Analysis page; confirm TopicView is visible above compact notation input
- [ ] Confirm evaluation bar is **not** present (removed per Principle 1)
- [ ] Confirm board control buttons do **not** include `Luu bien` (removed per Principle 3)
- [ ] Create variation via notation `Xac nhan` action; verify NewVariationModal opens with move list
- [ ] Create variation via move-list save (floppy icon); verify NewVariationModal opens with equivalent payload
- [ ] Verify both creation entry points generate identical variation data structure

### Variation Management (Analysis)

- [ ] Click variation row edit icon; verify full-info modal opens
- [ ] In edit modal, rename variation and confirm save updates name
- [ ] In edit modal, click delete and confirm variation is removed from list
- [ ] Undo/redo moves on board; confirm moves list reflects current position
- [ ] Jump-to-move by clicking a move in transcript; confirm board updates
- [ ] Select different variation; confirm board resets and replays from new variation's `initialFen + moves[]`

### Library Page

- [ ] Load Library page; verify TopicView displays folder hierarchy
- [ ] Click folder; confirm only direct children (folders + variations) are shown
- [ ] Select variation in Library; confirm board displays variation in **read-only** mode
- [ ] Try clicking/dragging piece in Library board; confirm no piece movement (interactive=false)
- [ ] Verify board control buttons and move manipulations are disabled in Library

### Tab Switching

- [ ] In Analysis, load a variation and move pieces (navigate to move index 3)
- [ ] Switch to Library tab; verify board is still showing the same variation at move index 3
- [ ] Switch back to Analysis; confirm board state persists (same variation, same move index)
- [ ] Select different variation in Library; switch to Analysis; confirm board shows new variation

### Lint & Code Quality

- [ ] Run `npm run -s lint` and verify 0 errors (warnings acceptable)
- [ ] Confirm no import resolution failures or TypeScript type errors

## Validation Evidence Required for PR Merge

1. **Lint**: `npm run -s lint` produces 0 errors
2. **Screens**: Manual validation checklist above (mark each as [x])
3. **Hydration**: Hard refresh landing and Analysis pages; screenshot no blank states
4. **Tab switch**: Screenshot board state persists when switching tabs

## Notes on Deferred Features

**Practice Mode** (Phase 3+):

- Move checking logic would compare user input vs. expectedMoves[currentIndex]
- Correct move: highlight and advance; wrong move: highlight correct move and advance
- Not needed for Phase 1 Analysis/Library

**Mindmap** (Phase 3+):

- Read-only derived graph from folder tree + variation list
- Not needed for Phase 1 Analysis/Library

**Auth & User Sync** (Phase 3+):

- Supabase integration, guest→user data migration on login
- Not needed for Phase 1 (guest-only with localforage)

**Validation Engine** (Phase 2+):

- In Phase 1, accept all move input and replay deterministically
- Validation (piece-specific rules, board constraints) deferred to Phase 2

## Validation Notes (2026-04-04, Revised Scope)

- Phase 1 delivers Analysis (CRUD) + Library (browse) only
- TopicView is a feature-level data-connected component at `src/features/TopicView/TopicView.tsx`
- Unified Board component with `interactive` prop (true for Analysis, false for Library)
- Lint must pass with 0 errors before code review
- Manual validation checklist above is release gate for Phase 1
- All constitution principles (1-5) will be verified during validation
