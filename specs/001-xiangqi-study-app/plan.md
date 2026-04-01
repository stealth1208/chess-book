# Implementation Plan: Xiangqi Study App Phase 1 MVP

**Branch**: `001-xiangqi-study-app` | **Date**: 2026-03-31 | **Spec**: `/specs/001-xiangqi-study-app/spec.md`
**Input**: Feature specification from `/specs/001-xiangqi-study-app/spec.md`

## Summary

Deliver a web-first Xiangqi opening study MVP with a pure rules engine, variation and folder management, analysis replay, and persistence split across local guest mode and Supabase-backed authenticated mode. The implementation keeps engine logic isolated from UI, stores study data as `initialFen + moves[]`, and adds deterministic sync behavior by auto-migrating local guest data on first sign-in.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x, Next.js 16.2.1 (App Router)  
**Primary Dependencies**: Next.js, React, Zustand, @tanstack/react-query, Mantine, next-pwa, localforage, Supabase client SDK  
**Storage**: localforage (IndexedDB) for guest mode + Supabase PostgreSQL for authenticated mode  
**Testing**: ESLint 9 (existing), plus Vitest + Testing Library for unit/component tests and Playwright for key E2E flows  
**Target Platform**: Desktop and mobile browsers (PWA-installable)  
**Project Type**: Frontend web application (single Next.js project)  
**Performance Goals**: Load and render full library under 100 variations without perceptible lag; board interaction remains responsive (<16ms typical frame budget for drag/move UI)  
**Constraints**: Engine must remain UI-independent; Phase 1 excludes checkmate/AI/search optimization; no drag-and-drop in folder tree; offline-basic operation required  
**Scale/Scope**: Single-user study library per account; <100 mindmap nodes in Phase 1; folder tree plus variation CRUD and replay/practice entry points

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The current constitution file is still a template (`.specify/memory/constitution.md`) with placeholder principles and no enforceable ratified gates.

Provisional gate policy for this plan:

- PASS: Follow explicit spec constraints as temporary governing rules.
- PASS: Preserve architecture separation (`engine` pure logic, UI render-only, structured data storage).
- PASS: Keep Phase 1 scope strict (no AI/search/checkmate additions).

Post-design re-check (Phase 1 outputs):

- PASS: Data model and contracts preserve `FEN + moves[]` as canonical state.
- PASS: Contracts keep folder tree concerns separate from variation logic.
- PASS: No unjustified complexity introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-xiangqi-study-app/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── components/
│   ├── library/
│   ├── mindmap/
│   └── practice/
├── components/
│   └── Board/
├── engine/
├── features/
└── store/

public/
Design/
```

**Structure Decision**: Use the existing single Next.js app structure, with domain logic in `src/engine`, global state in `src/store`, and route-specific UI under `src/app/*`.

## Complexity Tracking

No constitution violations or complexity waivers required at planning time.
