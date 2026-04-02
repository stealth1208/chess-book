# Implementation Plan: Xiangqi Study App — Phase 1 MVP

**Branch**: `001-xiangqi-study-app` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-xiangqi-study-app/spec.md`

## Summary

Build a web PWA for studying Xiangqi (Chinese chess) openings. Core capabilities:

- Play moves on an interactive board, save named variations (`initialFen + moves[]`)
- Organize variations in a folder tree (purely organizational — no semantic relationships between variations)
- Replay saved variations move-by-move; practice by guessing the next move (wrong → highlight correct, advance, no reset)
- View a read-only containment-based mindmap derived from the folder/variation tree
- Guest mode (localforage) with automatic first-signin migration to Supabase

Technical approach: Next.js App Router + Zustand for state; pure engine module decoupled from UI; localforage for Phase 1 guest storage; Supabase PostgreSQL for authenticated storage.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 15 (App Router), React 19, Mantine 7, Tailwind CSS 4, Zustand 5, localforage, next-pwa  
**Storage**: localforage / IndexedDB (guest); Supabase PostgreSQL (authenticated)  
**Testing**: ESLint (lint enforced); Vitest + React Testing Library + Playwright (planned, see research Decision 6)  
**Target Platform**: Web (Desktop + Mobile browser), PWA-installable  
**Project Type**: web-app (PWA)  
**Performance Goals**: <100 variations load with full replay within normal React render budget; mindmap renders ≤100 nodes without layout jank  
**Constraints**: Offline-capable for guest mode; engine module stays independent of UI; no checkmate detection, no AI, no drag-drop in Phase 1  
**Scale/Scope**: <100 mindmap nodes, <100 variations per folder, single-user per session

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The project constitution (`/.specify/memory/constitution.md`) contains placeholder template text only — no project-specific principles have been ratified. Therefore no constitution gates apply.

**Post-design re-check**: Still no ratified constitution. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-xiangqi-study-app/
├── plan.md              # This file
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: entity definitions and validation rules
├── quickstart.md        # Phase 1: dev setup and validation checklist
├── contracts/
│   ├── engine-contract.md   # Engine and practice evaluation interfaces
│   └── storage-contract.md  # Persistence and sync contracts
└── tasks.md             # Phase 2 output (separate /speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (TopNav, AuthBootstrap)
│   ├── page.tsx                  # Analysis tab (default route)
│   ├── globals.css
│   ├── components/               # App-level client components
│   │   ├── AuthBootstrap.tsx     # Auth subscription + migration trigger
│   │   ├── InputNotation.tsx     # Move notation input
│   │   └── NewVariationModal.tsx # Save variation form
│   ├── library/
│   │   └── page.tsx              # Library management page
│   ├── mindmap/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── MindmapCanvas.tsx       # Containment-based node grid
│   │       └── MindmapDetailPanel.tsx  # Selected node metadata
│   └── practice/
│       ├── page.tsx
│       └── components/
│           ├── AccuracyCircle.tsx
│           ├── ActionButtons.tsx
│           └── ControlGroups.tsx
├── components/                   # Shared UI components
│   ├── MoveListPanel.tsx         # Analysis move list + library variation list
│   ├── QuickStatsWidget.tsx
│   ├── TopicTreeView.tsx         # Folder/variation tree (Mantine Tree)
│   ├── TopNav.tsx
│   └── Board/
│       ├── Board.tsx
│       ├── Piece.tsx
│       └── Square.tsx
├── engine/                       # Pure board logic — UI-independent
│   ├── types.ts                  # Piece, Move, BoardState, Coord
│   ├── board.ts                  # parseFEN, applyMove, board state
│   ├── rules.ts                  # validateMove by piece type
│   ├── game.ts                   # Game session, undo/redo, formatMove
│   ├── moveNotation.ts           # Canonical move string encode/decode
│   └── fen.ts                    # FEN serialization/deserialization
├── features/                     # Domain feature modules
│   ├── auth/
│   │   └── supabaseClient.ts     # Auth state (Phase 1: localStorage mock)
│   ├── errors/
│   │   └── studyErrors.ts        # Typed errors + user-facing messages (VN)
│   ├── library/
│   │   ├── folderService.ts      # Folder CRUD pure helpers (with delete guard)
│   │   └── variationService.ts   # Variation CRUD pure helpers
│   ├── mindmap/
│   │   └── mindmapMapper.ts      # mapStudyToMindmap: folders+variations → graph
│   ├── practice/
│   │   └── practiceEvaluator.ts  # evaluatePracticeMove (correct/wrong)
│   └── storage/
│       ├── migrationService.ts   # First-signin local→remote idempotent migration
│       └── remoteRepository.ts   # localforage-backed mock remote (Supabase stub)
└── store/
    └── useGameStore.ts           # Central Zustand store (persist middleware)
```

**Structure Decision**: Single Next.js full-stack project. No separate backend process — Supabase handles auth/DB. Engine is isolated in `src/engine/` as pure functions with no UI imports. Feature business logic lives in `src/features/` as independent modules. Zustand store in `src/store/` is the single source of truth for all UI state.

## Complexity Tracking

> No constitution violations — no entries required.
