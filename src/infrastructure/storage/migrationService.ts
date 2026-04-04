import { localRepository } from '@/infrastructure/storage/localRepository';
import { remoteRepository } from '@/infrastructure/storage/remoteRepository';
import type { MigrationStatus } from '@/shared/study/types/study';

const MIGRATION_PREFIX = 'xiangqi.study.migrated';

function markerKey(userId: string): string {
  return `${MIGRATION_PREFIX}.${userId}`;
}

function hasMigrated(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(markerKey(userId)) === '1';
}

function markMigrated(userId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(markerKey(userId), '1');
}

export async function migrateGuestDataOnFirstSignIn(userId: string): Promise<MigrationStatus> {
  if (hasMigrated(userId)) {
    return 'success';
  }

  const snapshot = await localRepository.loadSnapshot();

  if (snapshot.folders.length === 0 && snapshot.variations.length === 0) {
    markMigrated(userId);
    return 'success';
  }

  try {
    await remoteRepository.upsertFolders(userId, snapshot.folders);
    await remoteRepository.upsertVariations(userId, snapshot.variations);
    markMigrated(userId);
    return 'success';
  } catch {
    return 'failed';
  }
}
