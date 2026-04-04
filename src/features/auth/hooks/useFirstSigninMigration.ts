'use client';

import { useCallback } from 'react';
import { migrateGuestDataOnFirstSignIn } from '@/infrastructure/storage/migrationService';
import { handleMigrationFailure } from '@/shared/study/errors/studyErrors';

export function useFirstSigninMigration() {
  const runMigration = useCallback(async (userId: string | null) => {
    if (!userId) return;

    const result = await migrateGuestDataOnFirstSignIn(userId);
    if (result !== 'success') {
      console.warn(handleMigrationFailure());
    }
  }, []);

  return { runMigration };
}
