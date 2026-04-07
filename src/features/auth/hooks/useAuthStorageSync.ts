'use client';

import { useCallback } from 'react';
import { useTopicStore } from '@/shared/store/useTopicStore';

export function useAuthStorageSync() {
  const setAuthUser = useTopicStore((state) => state.setAuthUser);
  const syncLibraryFromStorage = useTopicStore((state) => state.syncLibraryFromStorage);

  const syncForUser = useCallback(
    async (userId: string | null) => {
      setAuthUser(userId);
      await syncLibraryFromStorage();
    },
    [setAuthUser, syncLibraryFromStorage]
  );

  return { syncForUser };
}
