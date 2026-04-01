# Quickstart: Xiangqi Study App Phase 1

## Feature Docs Index

- Spec: `specs/001-xiangqi-study-app/spec.md`
- Plan: `specs/001-xiangqi-study-app/plan.md`
- Research: `specs/001-xiangqi-study-app/research.md`
- Data model: `specs/001-xiangqi-study-app/data-model.md`
- Contracts: `specs/001-xiangqi-study-app/contracts/`
- Tasks: `specs/001-xiangqi-study-app/tasks.md`

## Prerequisites

- Node.js 20+
- npm 10+

## Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Core Pages to Verify

- Analysis page: board interaction, move validation, undo/redo, jump to move
- Library page: folder tree view, variation list/load behavior
- Practice page: variation-driven move checking flow UI
- Mindmap page: read-only derived graph rendering (<100 nodes)

## Data Setup

- Guest mode: use local storage path (localforage)
- User mode: configure Supabase env variables when integration is added

## Suggested Environment Variables (for upcoming Supabase integration)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Test Commands (after test tooling is added)

```bash
npm run lint
npm run test
npm run test:e2e
```

## Manual Validation Checklist

1. Create folder and nested folder in library view.
2. Record a variation from board moves and save it.
3. Reload variation and confirm replay from `initialFen + moves[]` is deterministic.
4. Test undo, redo, and jump-to-move behavior.
5. Sign in with local guest data present and verify auto-migration occurs.
6. Confirm app remains usable offline for previously loaded local data.

## Validation Notes (2026-03-31)

- Lint check: pass with warnings only (no blocking errors).
- Engine tasks are intentionally deferred under the `dont touch engine` constraint.
- Non-engine user stories completed: US2, US3, US4, US5.
- PWA validation now warns at build time if `public/manifest.json` or `public/sw.js` is missing.
