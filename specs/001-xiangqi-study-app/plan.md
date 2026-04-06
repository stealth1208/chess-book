# Implementation Plan: Xiangqi Study App Phase 1 (Plan Update)

**Branch**: `001-xiangqi-study-app` | **Date**: 2026-04-04 | **Spec**: `specs/001-xiangqi-study-app/spec.md`
**Input**: Feature specification from `/specs/001-xiangqi-study-app/spec.md`

## Summary

Deliver a Xiangqi study app focused on two screens: Analysis (variation CRUD and move replay) and Library (read-only variation browsing). Both screens share one `Board` component with an `interactive` mode prop. `TopicView` (renamed from `TopicTreeView`) is a data-connected feature-level component and lives under `src/features/TopicView/` so it can couple directly to the store. Validation/error engine, Practice, Mindmap, and Auth are all deferred.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.4, Next.js 16.2.1 (App Router)  
**Primary Dependencies**: Zustand 5, Mantine 8, localforage 1.10, next-pwa 5.6  
**Storage**: Local IndexedDB via localforage (guest mode), no cloud sync in this phase  
**Testing**: ESLint 9 + manual validation checklist  
**Target Platform**: Desktop + mobile browsers (PWA-ready)  
**Project Type**: Single Next.js web application  
**Performance Goals**: Initial route interactive under 2s on dev hardware, smooth board interactions  
**Constraints**: Offline-capable guest-only mode, deterministic replay from `initialFen + moves[]`, no validation/error handling in this phase, no Auth in this phase  
**Scale/Scope**: Two active screens (Analysis + Library), local folder/variation management

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Principle 1 PASS: Analysis remains variation-CRUD first and excludes evaluation bar.
  - Target files: `src/features/analysis/AnalysisScreen.tsx`, `src/features/TopicView/TopicView.tsx`
- Principle 2 PASS: Exactly two variation-create entry points converge into one modal payload.
  - Target files: `src/shared/components/InputNotation.tsx`, `src/shared/components/MoveListPanel.tsx`, `src/shared/components/NewVariationModal.tsx`
- Principle 3 PASS: Board controls remain navigation/play only (no persistence action).
  - Target files: `src/shared/components/Board/Board.tsx`, `src/features/analysis/AnalysisScreen.tsx`
- Principle 4 PASS: Variation row edit affordance opens full detail modal (update + delete).
  - Target files: `src/features/TopicView/TopicView.tsx`, `src/shared/components/NewVariationModal.tsx`
- Principle 5 PASS: Hydration/readiness path remains deterministic and blank-screen safe.
  - Target files: `src/shared/store/useGameStore.ts`

Validation evidence required:

- `npm run -s lint` passes with 0 errors.
- Manual render checks pass on landing, Analysis, and Library.

## Project Structure

### Documentation (this feature)

```text
specs/001-xiangqi-study-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analysis-ui-contract.md
│   └── board-library-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── layout.tsx             # Tab switching, Layout shell
├── shared/
│   ├── components/
│   │   ├── Board/             # Shared board (interactive + read-only via prop)
│   │   ├── InputNotation.tsx  # Notation entry + Xac nhan trigger
│   │   ├── MoveListPanel.tsx  # Move transcript + save icon trigger
│   │   └── NewVariationModal.tsx # Unified variation create/edit/delete modal
│   └── store/
│       └── useGameStore.ts    # Zustand store: folders, variations, board state
└── features/
    ├── TopicView/
    │   └── TopicView.tsx      # Data-connected folder/variation tree (both screens)
    ├── analysis/
    │   └── AnalysisScreen.tsx # Analysis layout: TopicView + Board + input
    └── library/
        └── LibraryScreen.tsx  # Library layout: TopicView + Board (read-only)
```

**Structure Decision**: `TopicView` belongs in `src/features/TopicView/` because it directly connects to the Zustand store for CRUD operations. It is consumed by both `AnalysisScreen` and `LibraryScreen` without being generic shared infrastructure. `Board`, `InputNotation`, `MoveListPanel`, and `NewVariationModal` stay in `src/shared/components/` because they carry no data dependencies.

## Phase 0: Research

Outcomes already resolved:

- Board `interactive` prop cleanly covers Analysis (true) and Library (false) behavior difference.
- `TopicView` placed in `features/` because it calls store selectors and CRUD actions directly; importing cross-feature is acceptable since both Analysis and Library are sibling features.
- Deferred validation does not block replay (engine `applyMove` is already available).
- Tab switching shares one board state instance via store.

## Phase 1: Design & Contracts

Deliverables completed:

1. `data-model.md`: Folder, Variation, BoardState, VariationDraft, VariationDetailModalState entities
2. `contracts/board-library-contract.md`: Board component behavior by interactive mode
3. `contracts/analysis-ui-contract.md`: Analysis layout and CRUD interaction contract
4. `quickstart.md`: Manual validation checklist for landing, Analysis, Library, and tab switching
5. Agent context updated via `update-agent-context.sh copilot`

## Phase 2: Implementation & Validation

Implementation sequence:

1. Rename `TopicTreeView` to `TopicView`; move file to `src/features/TopicView/TopicView.tsx`
2. Update all import paths referencing old name/location
3. Wire `Board` `interactive` prop for Analysis (true) and Library (false)
4. Wire Analysis two creation entry points through `NewVariationModal`
5. Wire Library read-only board display from selected variation
6. Validate tab switching preserves board state
7. Run lint; complete manual checklist

Success criteria:

- Analysis: TopicView visible, both creation-entry-points open same modal, edit/delete modal works
- Library: TopicView visible for browsing, Board is non-interactive
- Tab switch: Board state survives screen change
- Lint: 0 errors; manual validation checklist: all items pass
