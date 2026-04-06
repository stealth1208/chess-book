# Tasks: Xiangqi Study App Phase 1

**Input**: Design documents from `/specs/001-xiangqi-study-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Plan Deltas Applied**:

- No setup feature-module structure task (current file organization accepted)
- Rename `TopicTreeView` → `TopicView`; place at `src/features/TopicView/TopicView.tsx` (data-connected; not shared infrastructure)
- Practice, Mindmap, Auth remain out of this phase
- Validation/error engine deferred to Phase 2

---

## Phase 1: User Story 1 — Analysis Variation CRUD (P1, MVP)

**Goal**: Analysis page hosts `TopicView` with full folder + variation CRUD and two variation-create entry points.

**Independent Test**:

- Create folder; rename folder; delete folder (blocked when it has children or direct variations).
- Create variation via notation `Xac nhan` and movelist save icon; both open same `NewVariationModal` with equivalent payload.
- Edit variation name and delete variation via TopicView row edit affordance.

### Tasks

- [x] T001 [US1] Move src/components/TopicTreeView.tsx to src/features/TopicView/TopicView.tsx and rename component symbol TopicTreeView → TopicView inside the file
- [x] T002 [US1] Update all import paths referencing TopicTreeView across src/ (AnalysisScreen, page.tsx, any other consumers) in src/features/analysis/AnalysisScreen.tsx and src/app/page.tsx
- [x] T003 [US1] Add store query helpers to src/shared/store/useGameStore.ts: foldersByParentId(), variationsByFolderId(), getFolder(), getVariation()
- [x] T004 [US1] Implement localforage persistence in src/shared/store/useGameStore.ts: persist folders + variations to IndexedDB on change; hydrate on mount
- [x] T005 [US1] Implement folder create action (new-folder button + name input flow) in src/features/TopicView/TopicView.tsx
- [x] T006 [P] [US1] Implement folder rename action (inline rename or rename modal) in src/features/TopicView/TopicView.tsx
- [x] T007 [US1] Implement folder delete with block check: prevent delete if folder has child folders or direct variations in src/features/TopicView/TopicView.tsx
- [x] T008 [US1] Place TopicView above compact notation area in Analysis layout in src/features/analysis/AnalysisScreen.tsx
- [x] T009 [P] [US1] Ensure evaluation bar is NOT rendered in src/features/analysis/AnalysisScreen.tsx (Principle 1 compliance)
- [x] T010 [P] [US1] Ensure board controls do NOT include `Luu bien` button in src/features/analysis/AnalysisScreen.tsx (Principle 3 compliance)
- [x] T011 [US1] Wire notation `Xac nhan` action to open NewVariationModal with VariationDraft payload in src/shared/components/InputNotation.tsx
- [x] T012 [P] [US1] Wire movelist save icon (floppy) to open same NewVariationModal with equivalent VariationDraft payload in src/shared/components/MoveListPanel.tsx
- [x] T013 [US1] Add variation row edit affordance (edit icon per row) in src/features/TopicView/TopicView.tsx; clicking opens VariationDetailModal
- [x] T014 [US1] Implement variation rename + delete actions in src/shared/components/NewVariationModal.tsx (state machine: view → edit → confirm; view → delete → confirm)

**Checkpoint**: Analysis CRUD fully functional — folder tree CRUD, both variation-create paths confirmed to produce equivalent payload, variation edit/delete working.

---

## Phase 2: Foundation

**Purpose**: Prepare shared Board `interactive` prop; verify base infrastructure stability.

**Dependency**: Phase 1 (T001–T002) TopicView rename/move must be complete before wiring board modes.

- [x] T015 Add/verify Board `interactive` prop API and disable all piece interaction when `interactive={false}` in src/shared/components/Board/Board.tsx
- [x] T016 [P] Suppress click and drag events on Piece when Board renders with `interactive={false}` in src/shared/components/Board/Piece.tsx
- [x] T017 [P] Ensure deterministic hydration path in src/shared/store/useGameStore.ts: loading guard; no blank screen on hard refresh
- [x] T018 Preserve Analysis/Library shared board-state on tab switch: board state survives switching between screens in src/app/layout.tsx

**Checkpoint**: Foundation stable — interactive and read-only board modes functioning correctly.

---

## Phase 3: User Story 2 — Library Read-Only View (P2, MVP)

**Goal**: Library screen uses same Board + control layout as Analysis with board interaction fully disabled.

**Independent Test**:

- Select folder then variation from Library via TopicView; board replays from that variation's `initialFen + moves[]`.
- Attempting to drag or click pieces in Library has no effect.
- Layout visually matches Analysis screen framing.

### Tasks

- [x] T019 [US2] Wire Library screen to TopicView for folder/variation browsing and selection in src/features/library/LibraryScreen.tsx
- [x] T020 [US2] Render Board with `interactive={false}` for read-only display in src/features/library/LibraryScreen.tsx
- [x] T021 [P] [US2] Ensure MoveListPanel move transcript is non-interactive in Library context (no click-to-jump) in src/shared/components/MoveListPanel.tsx
- [x] T022 [P] [US2] Verify Analysis and Library share same Board + control layout framing in src/features/analysis/AnalysisScreen.tsx and src/features/library/LibraryScreen.tsx

**Checkpoint**: Library browsing and read-only board working; layout consistent with Analysis.

---

## Phase 4: Integration, Validation, and Quality

**Purpose**: Final integration checks and quality gate evidence.

- [x] T023 Update any remaining TopicTreeView references across src/ not already caught by T002
- [ ] T024 [P] Manually validate Analysis → Library → Analysis tab switching: confirm board state is preserved across switches
- [x] T025 [P] Run `npm run -s lint` and resolve all errors to 0
- [ ] T026 [P] Complete quickstart manual checklist: landing hydration, Analysis CRUD, Library browse, tab switching

**Checkpoint**: Phase 1 implementation is code-complete; manual walkthrough items remain.

---

## Summary

- **Total tasks**: 26
- **Completed**: 24
- **Remaining**: 2 (`T024`, `T026`)
- **TopicView**: `src/features/TopicView/TopicView.tsx` (data-connected; not shared infrastructure)
- **Validation status**: `npm run -s lint` passes; `npm run -s build` passes
