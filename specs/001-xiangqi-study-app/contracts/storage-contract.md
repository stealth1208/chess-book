# Contract: Storage and Sync

## Scope

Defines persisted contract for folder/variation data across guest local storage and authenticated Supabase storage.

## Folder Record Contract

```json
{
  "id": "uuid",
  "userId": "uuid-or-null",
  "name": "string(1..80)",
  "parentId": "uuid-or-null",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## Variation Record Contract

```json
{
  "id": "uuid",
  "userId": "uuid-or-null",
  "folderId": "uuid-or-null",
  "name": "string(1..120)",
  "initialFen": "xiangqi-fen",
  "moves": ["a0a1", "b9b8"],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## Invariants

- `moves[]` contains canonical coordinate move strings.
- Replay result is deterministic from `initialFen + moves[]`.
- `parentId` and `folderId` must resolve within the same user scope.

## Migration Contract (Guest -> User)

- Trigger: first authenticated session with local guest data.
- Behavior: auto-migrate all local folders and variations to remote user scope.
- Conflict policy: local records are inserted as source of truth for initial migration.
- Completion: mark local cache as migrated to avoid duplicate uploads.

## Error Contract

- Validation errors are non-fatal to app shell and surfaced as user-friendly notifications.
- A malformed variation record must be skipped and logged for repair, not crash the library page.
