<!--
Sync Impact Report
- Version change: template-placeholder -> 1.0.0
- Modified principles:
	- Principle 1 placeholder -> Variation-Centric Analysis Workspace
	- Principle 2 placeholder -> Deterministic Variation Creation Entry Points
	- Principle 3 placeholder -> Single-Intent Control Surfaces
	- Principle 4 placeholder -> Complete Variation Management Visibility
	- Principle 5 placeholder -> Client-Safe Rendering and Hydration
- Added sections:
	- Product Interaction Standards
	- Delivery Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present in repository)
- Follow-up TODOs:
	- None
-->

# Xiangqi Study App Constitution

## Core Principles

### Variation-Centric Analysis Workspace

Analysis UI MUST prioritize variation CRUD workflows over evaluation visuals. The Analysis page
MUST exclude the evaluation bar and MUST keep TopicTreeView directly accessible as a primary
working surface.
Rationale: this product is a study and authoring tool, so the highest-value interaction is
organizing and refining opening lines.

### Deterministic Variation Creation Entry Points

New variation creation MUST be available through exactly two approved entry points:

1. notation confirmation action ("Xac nhan") and 2) save action from the move transcript block.
   Both entry points MUST open the same NewVariationModal and MUST pass the same validated notation
   payload.
   Rationale: mirrored behavior reduces user confusion and prevents divergent data paths.

### Single-Intent Control Surfaces

Board control buttons MUST focus on navigation and play-state actions only. Variation persistence
actions (for example "Luu bien") MUST NOT appear in the control button group and MUST remain in
dedicated variation management entry points.
Rationale: separating board mechanics from persistence actions keeps controls predictable.

### Complete Variation Management Visibility

Each variation item MUST expose an edit affordance. Edit action MUST open a full variation
information modal that supports update and delete operations in one place.
Rationale: users need immediate access to maintenance actions without hidden navigation.

### Client-Safe Rendering and Hydration

Shared interactive components and state hooks MUST be client-safe and hydration-stable. Any
loading boundary MUST have a deterministic readiness path, and changes MUST NOT introduce
render-blocking loops or blank-screen states.
Rationale: feature quality is invalid if core screens fail to render.

## Product Interaction Standards

- Analysis page layout MUST place TopicTreeView above a reduced-height notation input region.
- UI text labels for the two variation-creation entry points MUST remain distinct but behaviorally
  equivalent.
- Modal-based variation editing MUST include validation, update, and delete affordances.
- Interaction changes MUST preserve mobile and desktop operability.

## Delivery Workflow and Quality Gates

- Every spec touching Analysis, TopicTreeView, notation input, or variation modal behavior MUST
  include explicit interaction scenarios for creation, edit, and delete paths.
- Every implementation plan MUST pass a Constitution Check that maps proposed UI changes back to
  the five core principles.
- Every task list for UI work MUST include verification tasks for both variation-creation entry
  points and edit/delete modal flow.
- Pull requests MUST include evidence of successful local lint and manual render verification of
  the landing page and the Analysis page.

## Governance

This constitution is the highest-priority project policy for product interaction and delivery
behavior. Amendments require: (1) a documented proposal, (2) explicit update of dependent
templates, and (3) a version bump using semantic versioning.

Versioning policy:

- MAJOR for backward-incompatible governance changes or principle removals/redefinitions.
- MINOR for new principles or materially expanded mandatory guidance.
- PATCH for clarifications and non-semantic wording refinements.

Compliance review expectations:

- Plan reviews MUST validate Constitution Check items before implementation starts.
- Task reviews MUST verify principle coverage in concrete file-level tasks.
- PR reviews MUST block merge on unresolved constitution violations.

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
