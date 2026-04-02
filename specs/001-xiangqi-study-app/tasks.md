# Tasks: Xiangqi Study App Phase 1 MVP

**Input**: Design documents from `/specs/001-xiangqi-study-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests were not explicitly requested in the feature spec, so no dedicated test tasks are included.

**Organization**: Tasks are grouped by user story so each story can be built and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare project structure and shared scaffolding for implementation.

- [x] T001 Update feature scripts and task aliases in package.json
- [x] T002 Configure env template values for auth/storage in .env.example
- [x] T003 [P] Define shared storage key constants in src/features/storage/keys.ts
- [x] T004 [P] Define shared study domain types in src/features/types/study.ts
- [x] T005 Add baseline manual validation checklist section in specs/001-xiangqi-study-app/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core app infrastructure required before user stories.

**CRITICAL**: Complete this phase before user-story implementation.

- [x] T006 [P] Implement guest localforage repository methods in src/features/storage/localRepository.ts
- [x] T007 [P] Implement user-scoped remote repository contract in src/features/storage/remoteRepository.ts
- [x] T008 Implement folder/variation validators and invariants in src/features/validation/studyValidators.ts
- [x] T009 Implement shared storage service mode switching in src/features/storage/studyStorageService.ts
- [x] T010 Add foundational study state slices in src/store/useGameStore.ts
- [x] T011 Add normalized error mapping utilities in src/features/errors/studyErrors.ts
- [x] T012 Implement auth bootstrap hydration boundary in src/app/components/AuthBootstrap.tsx
- [x] T013 Add shared data loading status handlers in src/app/components/StudyLoadingBoundary.tsx

**Checkpoint**: Foundation complete, user stories can proceed.

---

## Phase 3: User Story 1 - Save and Load Variation (Priority: P1) MVP

**Goal**: Users can save and load variation lines deterministically from both Analysis Board and Library.

**Independent Test**: Save a variation in Analysis Board, reload from Library, and confirm replay result remains deterministic from `initialFen + moves[]`.

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement variation create/rename/delete validation behavior in src/features/library/variationService.ts
- [x] T015 [US1] Implement saveCurrentVariation action using `initialFen + moves[]` in src/store/useGameStore.ts
- [x] T016 [US1] Implement loadVariationById replay reconstruction in src/store/useGameStore.ts
- [x] T017 [P] [US1] Implement analysis-specific save button hook in src/app/analysis/hooks/useAnalysisVariationSave.ts
- [x] T018 [P] [US1] Implement library-specific load/select hook in src/app/library/hooks/useLibraryVariationLoad.ts
- [x] T019 [P] [US1] Implement library-specific save modal state hook in src/app/library/hooks/useLibraryVariationModal.ts
- [x] T020 [US1] Wire Analysis Board save variation UI actions in src/app/page.tsx
- [x] T021 [US1] Wire Library save/load actions and modal triggers in src/app/library/page.tsx
- [x] T022 [US1] Wire save variation modal submit behavior in src/app/components/NewVariationModal.tsx
- [x] T023 [US1] Wire variation list load action and feedback states in src/components/MoveListPanel.tsx
- [x] T024 [US1] Handle malformed variation replay errors in src/features/errors/studyErrors.ts

**Checkpoint**: US1 works independently and is release-ready as MVP.

---

## Phase 4: User Story 2 - Folder Organization Only (Priority: P2)

**Goal**: Users organize variations in folder tree with direct-child filtering and blocked delete for non-empty folders.

**Independent Test**: Create nested folders, move variations, click parent folder to see only direct children, and verify non-empty folder delete is blocked.

### Implementation for User Story 2

- [x] T025 [P] [US2] Implement folder create/rename rules in src/features/library/folderService.ts
- [x] T026 [US2] Implement blocked delete policy for non-empty folders in src/features/library/folderService.ts
- [x] T027 [US2] Implement direct-child variation filtering selectors in src/store/useGameStore.ts
- [x] T028 [P] [US2] Implement folder tree interaction hook in src/app/library/hooks/useFolderTreeActions.ts
- [x] T029 [US2] Wire folder tree CRUD and blocked-delete warning UI in src/components/TopicTreeView.tsx
- [x] T030 [US2] Wire folder selection and filtered variation listing flow in src/app/library/page.tsx
- [x] T031 [US2] Implement variation folder reassignment action in src/features/library/variationService.ts

**Checkpoint**: US2 is independently functional.

---

## Phase 5: User Story 3 - Practice Mode (Priority: P3)

**Goal**: Users practice variations with correct/wrong scoring and wrong-move highlight-plus-advance behavior.

**Independent Test**: In Practice, submit correct and wrong moves and confirm counters plus highlight/advance behavior without reset.

### Implementation for User Story 3

- [x] T032 [P] [US3] Implement practice evaluator contract behavior in src/features/practice/practiceEvaluator.ts
- [x] T033 [US3] Implement practice session actions/state in src/store/useGameStore.ts
- [x] T034 [P] [US3] Implement practice board input hook in src/app/practice/hooks/usePracticeMoveInput.ts
- [x] T035 [P] [US3] Implement practice session controls hook in src/app/practice/hooks/usePracticeSessionControls.ts
- [x] T036 [US3] Wire practice page gameplay and selection flow in src/app/practice/page.tsx
- [x] T037 [US3] Wire practice counters and timer state in src/app/practice/components/ControlGroups.tsx
- [x] T038 [US3] Wire practice feedback and action controls in src/app/practice/components/AccuracyCircle.tsx
- [x] T039 [US3] Wire reset/retry/next callbacks in src/app/practice/components/ActionButtons.tsx

**Checkpoint**: US3 works independently with saved variations.

---

## Phase 6: User Story 4 - Mindmap Read-Only View (Priority: P4)

**Goal**: Users view a containment-only mindmap derived from folders and variations.

**Independent Test**: Mindmap renders folder-to-folder and folder-to-variation edges only and supports read-only selection/detail display.

### Implementation for User Story 4

- [x] T040 [P] [US4] Implement containment graph mapper in src/features/mindmap/mindmapMapper.ts
- [x] T041 [US4] Implement derived graph selectors in src/store/useGameStore.ts
- [x] T042 [P] [US4] Implement mindmap viewport state hook in src/app/mindmap/hooks/useMindmapViewportState.ts
- [x] T043 [P] [US4] Implement mindmap node selection hook in src/app/mindmap/hooks/useMindmapNodeSelection.ts
- [x] T044 [US4] Wire graph rendering interactions in src/app/mindmap/components/MindmapCanvas.tsx
- [x] T045 [US4] Wire selected node details panel in src/app/mindmap/components/MindmapDetailPanel.tsx
- [x] T046 [US4] Wire mindmap page data loading and selection flow in src/app/mindmap/page.tsx

**Checkpoint**: US4 works independently and stays under scale target.

---

## Phase 7: User Story 5 - Auth Sync and First Sign-in Migration (Priority: P5)

**Goal**: Guest data auto-migrates at first sign-in and app switches to user-scoped sync.

**Independent Test**: With guest data, first sign-in migrates once; subsequent sign-ins do not duplicate records.

### Implementation for User Story 5

- [x] T047 [P] [US5] Implement auth session adapter/listener methods in src/features/auth/supabaseClient.ts
- [x] T048 [US5] Implement idempotent migration coordinator in src/features/storage/migrationService.ts
- [x] T049 [P] [US5] Implement auth state sync hook in src/app/hooks/useAuthStorageSync.ts
- [x] T050 [P] [US5] Implement first-signin migration trigger hook in src/app/hooks/useFirstSigninMigration.ts
- [x] T051 [US5] Wire auth mode switching and sync actions in src/store/useGameStore.ts
- [x] T052 [US5] Wire migration triggers in src/app/components/AuthBootstrap.tsx
- [x] T053 [US5] Implement migration failure user messaging in src/features/errors/studyErrors.ts

**Checkpoint**: US5 works independently with migration guarantees.

---

## Phase 8: Polish and Cross-Cutting Concerns

**Purpose**: Final hardening, responsiveness, and deferred user-owned engine item.

- [x] T054 [P] Optimize derived selectors for library and mindmap in src/store/useGameStore.ts
- [x] T055 [P] Improve responsive tab layout consistency in src/app/globals.css
- [x] T056 Validate PWA requirements and build-time checks in next.config.ts
- [x] T057 Run quickstart manual validation and update notes in specs/001-xiangqi-study-app/quickstart.md
- [ ] T058 Improve engine quality baseline in src/engine/ (user-owned; execute after all non-engine tasks)

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1: no dependencies.
- Phase 2: depends on Phase 1 and blocks all user stories.
- Phase 3 through Phase 7: depend on Phase 2 completion.
- Phase 8: depends on selected user stories completion.

### User Story Dependencies

- US1 (P1 Save/Load Variation): starts immediately after Foundational; no dependency on other stories.
- US2 (P2 Folder Organization): depends on US1 save/load pathways for integrated library behavior.
- US3 (P3 Practice): depends on US1 saved variations.
- US4 (P4 Mindmap): depends on US2 folder/variation organization data.
- US5 (P5 Auth/Migration): depends on Foundational storage/auth and integrates with US1/US2 data flows.

### Recommended Delivery Order (Save/Load Priority)

1. Phase 1 and Phase 2
2. US1 (Save/Load Variation from Analysis and Library)
3. US2 (Folder Organization)
4. US3 and US4
5. US5
6. Phase 8 polish and final user-owned engine improvement task

---

## Parallel Execution Examples

### US1 Save/Load Variation

```bash
Task: T014 src/features/library/variationService.ts
Task: T017 src/app/analysis/hooks/useAnalysisVariationSave.ts
Task: T018 src/app/library/hooks/useLibraryVariationLoad.ts
Task: T019 src/app/library/hooks/useLibraryVariationModal.ts
```

### US2 Folder Organization

```bash
Task: T025 src/features/library/folderService.ts
Task: T028 src/app/library/hooks/useFolderTreeActions.ts
```

### US3 Practice Mode

```bash
Task: T032 src/features/practice/practiceEvaluator.ts
Task: T034 src/app/practice/hooks/usePracticeMoveInput.ts
Task: T035 src/app/practice/hooks/usePracticeSessionControls.ts
```

### US4 Mindmap

```bash
Task: T040 src/features/mindmap/mindmapMapper.ts
Task: T042 src/app/mindmap/hooks/useMindmapViewportState.ts
Task: T043 src/app/mindmap/hooks/useMindmapNodeSelection.ts
```

### US5 Auth Migration

```bash
Task: T047 src/features/auth/supabaseClient.ts
Task: T049 src/app/hooks/useAuthStorageSync.ts
Task: T050 src/app/hooks/useFirstSigninMigration.ts
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Deliver US1 end-to-end, including save from Analysis Board and load from Library.
3. Validate US1 independent test and ship MVP.

### Incremental Delivery

1. Add US2 organizational behaviors.
2. Add US3 practice and US4 mindmap.
3. Add US5 migration/sync.
4. Finish Phase 8 polish and T058.

### Parallel Team Strategy

1. Team completes Setup and Foundational.
2. Then split by hooks/services:
   - Developer A: US1 store and service tasks.
   - Developer B: US1 analysis/library hooks and page wiring.
   - Developer C: Prepare US2 folder hooks and UI wiring.
3. Merge by user story checkpoint.

---

## Notes

- [P] tasks touch separate files and can run in parallel.
- [US#] labels map tasks to independent user stories.
- Hook tasks are separated by concern and feature; no merged all-in-one hook.
- Engine tasks are deferred from user stories and represented as final T058 user-owned task.
