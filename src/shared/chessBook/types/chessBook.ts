export type Folder = {
  id: string;
  userId: string | null;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Variation = {
  id: string;
  userId: string | null;
  folderId: string | null;
  name: string;
  initialFen: string;
  moves: string[];
  createdAt: string;
  updatedAt: string;
};

export type MigrationStatus = "success" | "partial" | "failed";

export type MigrationJob = {
  userId: string;
  localFolderCount: number;
  localVariationCount: number;
  migratedAt: string;
  status: MigrationStatus;
};

export type ChessBookSnapshot = {
  folders: Folder[];
  variations: Variation[];
};

export type ChessBookStorageMode = "guest" | "user";
