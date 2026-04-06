# Requirements Quality Checklist: Xiangqi Study App Phase 1

**Purpose**: Validate requirements consistency across spec, plan, research, data-model, and contracts; and validate data model requirements completeness and clarity.
**Created**: 2026-04-04
**Focus**: Domain 1 (Cross-artifact consistency) + Domain 3 (Data model quality)
**Depth**: Thorough

---

## Category A: Cross-Artifact Conflicts (GATING — resolve before implementation)

- [ ] CHK001 ⛔ GATE — Is there a single authoritative answer to whether `validateMove` is in scope for Phase 1? Spec §4.4 lists it as required; Research Decision 5 explicitly defers it; engine-contract.md repeats "must support rook, horse, cannon, pawn in Phase 1"; plan.md says "no validation engine in this phase." Three sources conflict with two. [Conflict, Spec §4.4 vs Research D5 vs engine-contract.md vs plan.md]

- [ ] CHK002 ⛔ GATE — Are "show legal moves on hover" requirements in the Board contract consistent with the validation deferral decision? Board-library-contract.md (interactive mode) says "Show legal moves on hover (highlight destination squares)" — this requires a working `validateMove`. If validation is deferred, this requirement is undeliverable in Phase 1. [Conflict, board-library-contract.md vs Research D5]

- [ ] CHK003 — Are phase numbering labels consistent across all artifacts? Spec §15 says "Phase 2: Practice mode, Mindmap"; plan.md, research.md, and tasks.md consistently call them "Phase 3+". [Conflict, Spec §15 vs plan.md vs research.md]

- [ ] CHK004 — Is the `userId` field inclusion decision consistent across artifacts? storage-contract.md includes `userId` on both Folder and Variation records; data-model.md explicitly states "No Auth: no userId field in Phase 1 entities." [Conflict, storage-contract.md vs data-model.md §Constraints]

- [ ] CHK005 — Is the guest→user data migration behavior in scope for Phase 1 or not? storage-contract.md contains an active "Migration Contract (Guest → User)" section; data-model.md explicitly defers MigrationJob to "Phase 2+". [Conflict, storage-contract.md vs data-model.md §Deferred Entities]

- [ ] CHK006 — Is React Query required for Phase 1 or not? Spec §2.1 lists React Query as a primary state dependency. Research D6 and all planning artifacts specify localforage-only with no server data sync in Phase 1. No Phase 1 task includes React Query setup. [Conflict, Spec §2.1 vs research.md D6 vs tasks.md]

---

## Category B: Requirement Completeness (Missing items that should be specified)

- [ ] CHK007 — Is the `Autoplay` feature requirement defined and scoped for Phase 1? Spec §8.2 lists "Autoplay" as an Analysis feature alongside drag/undo/redo. Plan.md, tasks.md, and contracts do not reference it. No task exists for autoplay implementation. [Gap, Spec §8.2]

- [ ] CHK008 — Is the UI error/warning requirement for blocked folder deletion specified with detail? Spec §6.4 says "UI should surface a clear error/warning when delete is blocked" but does not specify the UI mechanism (inline text, toast, modal dialog, disabled button with tooltip). [Completeness, Spec §6.4]

- [ ] CHK009 — Are requirements specified for what happens to in-progress board moves when the user switches tabs? Research D7 says "the same board instance persists" and "selecting a variation reloads board" — but does not define behavior for unsaved in-progress moves that have not been saved as a variation. [Gap, research.md D7]

- [ ] CHK010 — Are localforage key/namespace schema requirements defined? No artifact specifies which keys, namespaces, or storage format localforage uses for folders and variations. Schema migration behavior on version change is also unspecified. [Gap]

- [ ] CHK011 — Is the "selected state" visual requirement for Mantine Tree folder navigation defined? Spec §6.5 specifies "Use Mantine Tree" but does not define selected folder state appearance, active-variation highlight, or empty folder placeholder behavior. [Gap, Spec §6.5]

- [ ] CHK012 — Are requirements defined for a Variation with zero moves (position-only lineup)? Data-model, spec, and contracts treat moves[] as potentially empty but do not specify UI behavior (e.g., what the move transcript shows, whether the board renders, whether replay is considered valid). [Gap, data-model.md §2]

- [ ] CHK013 — Are store query helpers (`foldersByParentId`, `variationsByFolderId`, `getFolder`, `getVariation`) defined in a formal contract rather than only in data-model planning notes? These are implementation-critical but appear only in "Indexing and Query Strategy" which is a planning section, not a binding contract. [Gap, data-model.md §Indexing]

---

## Category C: Requirement Clarity (Vague or ambiguous specifications)

- [ ] CHK014 — Is "Layout fixed" in spec §13 quantified or clarified to define what it means alongside "Board responsive"? The two terms appear contradictory without definition. Does "layout fixed" mean fixed max-width, fixed column widths, fixed viewport breakpoints, or non-scrolling? [Ambiguity, Spec §13]

- [ ] CHK015 — Is `BoardState.interactive` specified as a computed value (derived from active screen) or a stored value (directly set in store)? data-model.md §3 defines it as a field on the BoardState transient, but does not clarify who sets it or whether it is driven by routing/screen context. [Ambiguity, data-model.md §3]

- [ ] CHK016 — Is `VariationDraft.source` ("analytics-only; not persisted") fully specified? Data-model §2.1 notes source is analytics-only but no analytics infrastructure exists or is planned. Is the field required for future compatibility, or is it dead weight? [Ambiguity, data-model.md §2.1]

- [ ] CHK017 — Is the move coordinate format constraint formally reconciled in the spec? Spec §5.2 provides only an example ("b0c2 = from b0 → to c2"). Data-model §2 defines the regex `^[a-i][0-9][a-i][0-9]$`. Spec does not cross-reference this constraint. [Clarity, Spec §5.2 vs data-model.md §2]

- [ ] CHK018 — Is the Library move transcript click behavior specified in the spec (not just in the Board contract)? Board-library-contract.md specifies "Click on move: ignored (no jump-to-move in Library)" but spec §8.4 ("Click move → jump") is under the Analysis section only. Library transcript behavior is contract-derived, not spec-derived. [Clarity, board-library-contract.md vs Spec §8.4]

---

## Category D: Data Model Consistency

- [ ] CHK019 — Are `createdAt` and `updatedAt` timestamp fields consistently required across all artifacts? Spec §6.1 Folder type definition omits them; data-model.md §1 includes them; storage-contract.md includes them. Are timestamps a Phase 1 requirement or planning-artifact additions? [Consistency, Spec §6.1 vs data-model.md §1 vs storage-contract.md]

- [ ] CHK020 — Is the `VariationDetailModalState` entity grounded in a spec requirement? data-model.md §2.2 defines its full state machine (closed → open(view) → open(edit) → closed) and fields. Spec §7.3 lists "Rename" and "Delete" as features but does not define a modal or its state machine. [Consistency, data-model.md §2.2 vs Spec §7.3]

- [ ] CHK021 — Are requirements consistent about whether a variation can exist with `folderId = null` ("unfoldered")? Spec §6.2 shows all variations inside folders; data-model Variation.folderId is "string | null"; VariationDraft.folderId is "string | null (optional folder)". Does the spec intentionally allow unfoldered variations? [Consistency, Spec §6.2 vs data-model.md §2]

- [ ] CHK022 — Is the `Board.onMoveApplied(move: string)` callback type consistent with the `MoveRecord` value object? board-library-contract.md callback emits a `string`; data-model §4 MoveRecord is a structured object `{from, to, pieceType, color}`. Is the string the raw coordinate notation or a serialized MoveRecord? [Consistency, board-library-contract.md vs data-model.md §4]

---

## Category E: Scenario Coverage

- [ ] CHK023 — Are requirements defined for what the Analysis board shows before any variation is selected (empty/initial state)? Board contract §Error Boundaries defines `variationId=null` behavior (empty board), but the spec does not address this first-start scenario in §8 or §7. [Coverage, Gap]

- [ ] CHK024 — Are requirements defined for folder tree behavior when all folders are deleted (empty root state)? Spec §6 describes the tree but not the empty-root scenario (no folders, no variations). Is a call-to-action or empty-state placeholder required? [Coverage, Gap]

- [ ] CHK025 — Are concurrent or rapid user interaction requirements addressed? E.g., clicking a second variation before the first variation's board load completes. No spec section addresses race conditions or debounce requirements. [Coverage, Gap]

---

## Summary

| Category                              | Items         | Priority                              |
| ------------------------------------- | ------------- | ------------------------------------- |
| A — Cross-artifact conflicts (GATING) | CHK001–CHK006 | Resolve first; block implementation   |
| B — Completeness gaps                 | CHK007–CHK013 | Fill before tasking dependent story   |
| C — Clarity / ambiguity               | CHK014–CHK018 | Clarify before wiring UI              |
| D — Data model consistency            | CHK019–CHK022 | Reconcile before store implementation |
| E — Scenario coverage                 | CHK023–CHK025 | Address in spec or explicitly defer   |

**Total items**: 25
**Gating items (⛔)**: CHK001, CHK002 (block all board interaction tasks); CHK003–CHK006 (block planning of affected stories)
