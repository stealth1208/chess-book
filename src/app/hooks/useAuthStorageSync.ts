'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';

export function useAuthStorageSync() {
  const setAuthUser = useGameStore((state) => state.setAuthUser);
  const syncLibraryFromStorage = useGameStore((state) => state.syncLibraryFromStorage);

  const syncForUser = useCallback(
    async (userId: string | null) => {
      setAuthUser(userId);
      await syncLibraryFromStorage();
    },
    [setAuthUser, syncLibraryFromStorage]
  );

  return { syncForUser };
}
