'use client';

import { useEffect } from 'react';
import { getCurrentAuthUser, subscribeAuthStateChange } from '@/features/auth/supabaseClient';
import { useAuthStorageSync } from '@/features/auth/hooks/useAuthStorageSync';
import { useFirstSigninMigration } from '@/features/auth/hooks/useFirstSigninMigration';

export function AuthBootstrap() {
  const { syncForUser } = useAuthStorageSync();
  const { runMigration } = useFirstSigninMigration();

  useEffect(() => {
    const applyAuth = async (userId: string | null) => {
      await runMigration(userId);
      await syncForUser(userId);
    };

    const initialUser = getCurrentAuthUser();
    void applyAuth(initialUser?.id ?? null);

    const unsubscribe = subscribeAuthStateChange((user) => {
      void applyAuth(user?.id ?? null);
    });

    return unsubscribe;
  }, [runMigration, syncForUser]);

  return null;
}
