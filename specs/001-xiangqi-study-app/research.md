# Research: Xiangqi Study App Phase 1 (Revised Scope)

## Decision 1: Canonical Replay Contract Remains `initialFen + moves[]`

- Decision: Keep variation persistence as `initialFen` with ordered coordinate moves (`a0a1` format).
- Rationale: Deterministic reconstruction is already implemented and supports replay and CRUD without extra state duplication. No validation engine needed (validation deferred to Phase 2).
- Alternatives considered: Store final board only; store snapshots per move; add validation layer.

## Decision 2: Scope Reduction — Two Screens (Analysis + Library Only)

- Decision: Phase 1 delivers Analysis (variation creation/edit/replay) and Library (browse/view only). Practice mode, Mindmap, and Auth features deferred to Phase 3+.
- Rationale: Simplified scope allows validation engine deferral and focuses on core study workflow (folder organization + variation replay).
- Alternatives considered: Attempt full stack with validation; include practice/mindmap in Phase 1.

## Decision 3: Unified Board Component with Interactivity Mode Prop

- Decision: Create single `Board.tsx` component with `interactive: boolean` prop. Analysis renders Board with `interactive={true}` (drag, move, undo/redo enabled); Library renders Board with `interactive={false}` (display-only, no clicks/drag allowed).
- Rationale: DRY principle; both screens use identical board layout and piece rendering; only behavior mode differs per context.
- Alternatives considered: Create separate BoardView and BoardEditor components; conditional rendering inside Board.

## Decision 4: TopicView Is a Feature-Level Data-Connected Component

- Decision: Rename `TopicTreeView` to `TopicView` and place it at `src/features/TopicView/TopicView.tsx`.
- Rationale: TopicView directly calls Zustand store selectors and CRUD actions. Data-connected "smart" components belong in `features/`, not in `shared/components/` which is reserved for pure/presentational UI.
- Alternatives considered: Place in `shared/components/` as a smart component; pass all data via props to keep it in shared.

## Decision 5: No Validation Engine in Phase 1

- Decision: Accept all move input without validation. Replay moves deterministically from board state via existing `applyMove()` engine logic. Validation (piece-specific rule checks, board state constraints) deferred to Phase 2.
- Rationale: Phase 1 focus is UI and flow (CRUD + replay), not rules enforcement. Existing `rules.ts` provides move validation when needed later.
- Alternatives considered: Implement full validation now; stub validation with console errors.

## Decision 6: No Auth in Phase 1

- Decision: Phase 1 is guest-mode only. All persistent data stored in localforage. Auth, Supabase integration, and user-mode sync deferred to Phase 3.
- Rationale: Reduces complexity; guest-mode library and Analysis functions independently of server. User-mode features (sync, sharing, cloud backup) are Phase 3+ scope.
- Alternatives considered: Implement auth but skip sync; use mock auth layer.

## Decision 7: Tab Switching Shares Board State

- Decision: When switching between Analysis and Library tabs, the same board instance persists. Selecting a variation in either tab reloads board from that variation's initialFen + moves[].
- Rationale: Minimizes state churn; allows seamless workflow (analyze in Analysis tab, browse library in Library tab, return to Analysis with board state intact).
- Alternatives considered: Reset board on tab switch; maintain separate board instances per tab.

## Decision 8: Validation Strategy Is Manual Scenario Verification + Lint

- Decision: Use lint (`npm run -s lint` with 0 errors) and manual scenario checks as release gate: landing page render, Analysis page CRUD, Library page browse, tab switching.
- Rationale: Automated test scaffold exists but not yet fully wired; practical quality gate is lint + deterministic manual verification.
- Alternatives considered: Block planning until full test framework adoption; skip validation checks.

## Clarification Resolution Summary

All Technical Context clarifications are resolved for planning Phase 1:

- ✅ Phase 1 scope: Analysis + Library only (no Practice, Mindmap, Auth).
- ✅ Board component: Single unified component with `interactive` prop.
- ✅ TopicView: feature-level data-connected component at `src/features/TopicView/TopicView.tsx`.
- ✅ Validation: Deferred to Phase 2; moveset validation only, no rules checking.
- ✅ Persistence: Localforage only; no server sync in Phase 1.
- ✅ Tab switching: Board state shared; variation selection reloads board.
- ✅ Quality gate: Lint + manual scenario verification (landing, Analysis, Library, tab switch).
