'use client';

import { useEffect } from 'react';
import { getCurrentAuthUser, subscribeAuthStateChange } from '@/features/auth/supabaseClient';
import { migrateGuestDataOnFirstSignIn } from '@/features/storage/migrationService';
import { handleMigrationFailure } from '@/features/errors/studyErrors';
import { useGameStore } from '@/store/useGameStore';

export function AuthBootstrap() {
  const { setAuthUser, syncLibraryFromStorage } = useGameStore();

  useEffect(() => {
    const applyAuth = async (userId: string | null) => {
      setAuthUser(userId);

      if (userId) {
        const result = await migrateGuestDataOnFirstSignIn(userId);
        if (result !== 'success') {
          // Keep non-blocking: app still loads with current mode.
          console.warn(handleMigrationFailure());
        }
      }

      await syncLibraryFromStorage();
    };

    const initialUser = getCurrentAuthUser();
    void applyAuth(initialUser?.id ?? null);

    const unsubscribe = subscribeAuthStateChange((user) => {
      void applyAuth(user?.id ?? null);
    });

    return unsubscribe;
  }, [setAuthUser, syncLibraryFromStorage]);

  return null;
}
