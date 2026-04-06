# Contract: Analysis UI Interaction

## Scope

Defines mandatory behavior for Analysis page variation workflows and control-surface boundaries.

## Layout Contract

- Evaluation bar must not render on Analysis page.
- TopicView must be directly visible as a primary CRUD surface.
- Notation input region must be reduced-height and placed below TopicView.

## Variation Creation Contract

Exactly two and only two create-entry triggers are supported:

1. Notation confirm action (`Xac nhan`)
2. Move-list save action (floppy icon in move transcript block)

Both triggers must:

- Open the same `NewVariationModal` component.
- Provide equivalent `VariationDraft` payload for the same board state.
- Use shared validation before persistence.

## Control Surface Contract

- Board control button group includes only navigation/play-state controls.
- Persistence action `Luu bien` must not appear in board controls.

## Variation Edit/Delete Contract

- Every variation item must expose edit affordance.
- Edit action opens full-detail modal containing:
  - current variation metadata
  - rename/update action
  - delete action with confirmation

## Failure and Safety Contract

- Modal validation failures are non-fatal and shown as user-facing messages.
- Hydration/loading boundaries must never leave landing or Analysis pages permanently blank.
- Malformed variation records must be handled without crashing page render.
