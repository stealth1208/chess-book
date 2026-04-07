export const STORAGE_NAMESPACE = "xiangqi.study" as const;

export const STORAGE_KEYS = {
  topics: `${STORAGE_NAMESPACE}.topics`,
  folders: `${STORAGE_NAMESPACE}.folders`,
  variations: `${STORAGE_NAMESPACE}.variations`,
  migrationState: `${STORAGE_NAMESPACE}.migration-state`,
} as const;
