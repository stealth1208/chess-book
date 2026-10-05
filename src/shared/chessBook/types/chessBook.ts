import type { Move } from '@/features/engine/notation/notation.types';

export type Topic = {
  id: string;
  userId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Folder = {
  id: string;
  userId: string | null;
  topicId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Variation = {
  id: string;
  userId: string | null;
  topicId: string;
  folderId: string | null;
  name: string;
  initialFen: string;
  moves: Move[];
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
  topics: Topic[];
  folders: Folder[];
  variations: Variation[];
};

export type ChessBookStorageMode = "guest" | "user";
