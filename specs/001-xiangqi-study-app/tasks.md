# Tasks: Xiangqi Study App Phase 1 MVP

**Input**: Design documents from `/specs/001-xiangqi-study-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification, so test tasks are omitted in this plan.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align project tooling and baseline structure for feature delivery.

- [x] T001 Update project scripts for lint/build/dev and future test placeholders in package.json
- [x] T002 Add environment variable template for Supabase integration in .env.example
- [x] T003 [P] Create shared domain type definitions for folder/variation/migration models in src/features/types/study.ts
- [x] T004 [P] Create storage key constants for local persistence in src/features/storage/keys.ts
- [x] T005 Create feature documentation index references in specs/001-xiangqi-study-app/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core architecture that all user stories depend on.

**CRITICAL**: No user story should start until this phase is complete.

- [ ] T006 Implement canonical move parser/formatter utilities in src/engine/moveNotation.ts (Deferred: engine lock)
- [ ] T007 Implement FEN parse/serialize helpers in src/engine/fen.ts (Deferred: engine lock)
- [x] T008 [P] Implement localforage-backed repository for folders and variations in src/features/storage/localRepository.ts
- [x] T009 [P] Implement Supabase repository interface and adapter skeleton in src/features/storage/remoteRepository.ts
- [x] T010 Create storage service facade with guest/user mode switching in src/features/storage/studyStorageService.ts
- [x] T011 Implement shared validation helpers for Folder and Variation contracts in src/features/validation/studyValidators.ts
- [x] T012 Extend global game store slices for variation replay and persistence hooks in src/store/useGameStore.ts
- [x] T013 Add shared error/notification mapping utilities for storage and validation failures in src/features/errors/studyErrors.ts

**Checkpoint**: Foundation complete, user stories can proceed.

**Dependency Override (Approved 2026-03-31)**: Continue non-engine implementation while T006/T007 remain deferred under the constraint `dont touch engine`.

---

## Phase 3: User Story 1 - Analysis Board and Replay Engine (Priority: P1) 🎯 MVP

**Goal**: User can play legal moves on board, replay a variation timeline, and navigate with undo/redo/jump.

**Independent Test**: On Analysis page, user can execute legal rook/horse/cannon/pawn moves, then undo/redo and jump to any move index while board state remains deterministic.

### Implementation for User Story 1

- [ ] T014 [US1] Implement missing Phase 1 move validation rules and edge constraints in src/engine/rules.ts
- [ ] T015 [US1] Refactor board state transitions to use canonical move notation helpers in src/engine/game.ts
- [ ] T016 [P] [US1] Add replay timeline helpers (apply sequence, jump index, current pointer) in src/engine/replay.ts
- [ ] T017 [US1] Wire replay helpers into store actions for apply/undo/redo/jump in src/store/useGameStore.ts
- [ ] T018 [P] [US1] Enhance board interaction callbacks for drag/drop move submission in src/components/Board/Board.tsx
- [ ] T019 [US1] Integrate move list click-to-jump and current highlight behavior in src/components/MoveListPanel.tsx
- [ ] T020 [US1] Connect analysis route layout to live replay state and controls in src/app/page.tsx

**Checkpoint**: US1 works independently and is MVP-demo ready.

---

## Phase 4: User Story 2 - Library Tree and Variation Management (Priority: P2)

**Goal**: User can create folder hierarchy, create/save/load/rename/delete variations, and load selected variation into board.

**Independent Test**: In Library view, user can manage folders and variations and load a selected variation to reconstruct board from `initialFen + moves[]`.

### Implementation for User Story 2

- [x] T021 [P] [US2] Implement folder CRUD service methods with parent/child integrity checks in src/features/library/folderService.ts
- [x] T022 [P] [US2] Implement variation CRUD service methods with notation/FEN validation in src/features/library/variationService.ts
- [x] T023 [US2] Implement library store slice for tree selection and variation list state in src/store/useGameStore.ts
- [x] T024 [P] [US2] Build folder tree UI with create/rename/delete actions using Mantine tree in src/components/TopicTreeView.tsx
- [x] T025 [P] [US2] Implement variation list panel actions (save/load/rename/delete) in src/components/MoveListPanel.tsx
- [x] T026 [US2] Wire library route data loading and folder click flow in src/app/library/page.tsx
- [x] T027 [US2] Implement save variation flow from current board timeline in src/app/components/NewVariationModal.tsx
- [x] T028 [US2] Connect variation load flow to replay reconstruction in src/store/useGameStore.ts

**Checkpoint**: US2 works independently with guest storage.

---

## Phase 5: User Story 3 - Practice Mode (Priority: P3)

**Goal**: User can practice a saved variation by matching expected moves with correctness scoring.

**Independent Test**: In Practice page, user selects a variation and receives correct/wrong feedback based on expected move sequence while score counters update.

### Implementation for User Story 3

- [x] T029 [P] [US3] Implement practice evaluation logic (`correct`/`wrong`, index progression) in src/features/practice/practiceEvaluator.ts
- [x] T030 [US3] Add practice session state and actions to global store in src/store/useGameStore.ts
- [x] T031 [P] [US3] Bind practice board move handler to evaluator in src/app/practice/page.tsx
- [x] T032 [P] [US3] Connect score/time/move counters to real session state in src/app/practice/components/ControlGroups.tsx
- [x] T033 [P] [US3] Connect accuracy and tips panels to practice result state in src/app/practice/components/AccuracyCircle.tsx
- [x] T034 [US3] Wire action controls for reset/retry/next variation behavior in src/app/practice/components/ActionButtons.tsx

**Checkpoint**: US3 is independently playable with variation-driven scoring.

---

## Phase 6: User Story 4 - Mindmap View (Priority: P4)

**Goal**: User can view a read-only mindmap derived from folder and variation data.

**Independent Test**: In Mindmap page, user sees a graph generated from current data with less than 100 nodes and can inspect node details.

### Implementation for User Story 4

- [x] T035 [P] [US4] Implement variation-to-mindmap transformation helpers in src/features/mindmap/mindmapMapper.ts
- [x] T036 [US4] Implement mindmap store selectors and derived graph memoization in src/store/useGameStore.ts
- [x] T037 [P] [US4] Render transformed graph and viewport interactions in src/app/mindmap/components/MindmapCanvas.tsx
- [x] T038 [P] [US4] Render node detail panel from selected graph node in src/app/mindmap/components/MindmapDetailPanel.tsx
- [x] T039 [US4] Wire mindmap page data load and read-only behavior in src/app/mindmap/page.tsx

**Checkpoint**: US4 view-only graph works independently.

---

## Phase 7: User Story 5 - Auth Sync and First Sign-In Migration (Priority: P5)

**Goal**: Authenticated users sync with Supabase, and first sign-in auto-migrates all guest local data.

**Independent Test**: With guest data present, first sign-in uploads folders/variations to remote user scope automatically and avoids duplicate migration on subsequent sign-ins.

### Implementation for User Story 5

- [x] T040 [P] [US5] Add Supabase client initialization and auth session helpers in src/features/auth/supabaseClient.ts
- [x] T041 [US5] Implement first-signin migration coordinator with idempotent marker in src/features/storage/migrationService.ts
- [x] T042 [P] [US5] Implement remote upsert and fetch methods for folders/variations in src/features/storage/remoteRepository.ts
- [x] T043 [US5] Wire auth state changes to storage mode switching in src/store/useGameStore.ts
- [x] T044 [US5] Trigger automatic migration on successful first authentication in src/app/layout.tsx
- [x] T045 [US5] Implement graceful fallback and user-facing error handling for migration failures in src/features/errors/studyErrors.ts

**Checkpoint**: US5 sync and migration flow works independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening across all stories.

- [x] T046 [P] Tune performance for library and mindmap rendering under 100 items in src/store/useGameStore.ts
- [x] T047 [P] Add PWA manifest/service worker configuration validation for offline basics in next.config.ts
- [ ] T048 Improve responsive layout consistency across analysis/library/practice/mindmap pages in src/app/globals.css
- [x] T049 Run end-to-end quickstart validation steps and update notes in specs/001-xiangqi-study-app/quickstart.md
- [x] T050 Final pass on error copy and Vietnamese terminology consistency in src/features/errors/studyErrors.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup.
- User Stories (Phase 3+): all depend on Foundational completion.
- Polish (Phase 8): depends on all implemented stories.

Override in effect: Non-engine tasks can proceed while engine tasks remain deferred by explicit user constraint.

### User Story Dependencies

- US1 (P1): starts immediately after Foundational.
- US2 (P2): depends on Foundational; can run in parallel with US1 if separate contributors are available.
- US3 (P3): depends on Foundational and variation loading from US2.
- US4 (P4): depends on Foundational and variation/folder data availability from US2.
- US5 (P5): depends on Foundational and storage services from US2.

### Suggested Story Order for Incremental Delivery

1. US1 (MVP board + replay)
2. US2 (library + variation management)
3. US3 (practice)
4. US4 (mindmap view)
5. US5 (auth sync + migration)

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallelizable US1 tasks
T016 src/engine/replay.ts
T018 src/components/Board/Board.tsx
```

### User Story 2

```bash
# Parallelizable US2 tasks
T021 src/features/library/folderService.ts
T022 src/features/library/variationService.ts
T024 src/components/TopicTreeView.tsx
T025 src/components/MoveListPanel.tsx
```

### User Story 3

```bash
# Parallelizable US3 tasks
T029 src/features/practice/practiceEvaluator.ts
T032 src/app/practice/components/ControlGroups.tsx
T033 src/app/practice/components/AccuracyCircle.tsx
```

### User Story 4

```bash
# Parallelizable US4 tasks
T035 src/features/mindmap/mindmapMapper.ts
T037 src/app/mindmap/components/MindmapCanvas.tsx
T038 src/app/mindmap/components/MindmapDetailPanel.tsx
```

### User Story 5

```bash
# Parallelizable US5 tasks
T040 src/features/auth/supabaseClient.ts
T042 src/features/storage/remoteRepository.ts
```

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 and Phase 2.
2. Complete US1 and validate independently.
3. Complete US2 and validate save/load flow.
4. Release MVP subset (US1 + US2).

### Incremental Expansion

1. Add US3 practice mode.
2. Add US4 mindmap view.
3. Add US5 auth sync and migration.
4. Finish Phase 8 polish and quickstart validation.
