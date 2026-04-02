'use client';

import { ReactNode } from 'react';

type StudyLoadingBoundaryProps = {
  isReady: boolean;
  children: ReactNode;
};

export function StudyLoadingBoundary({ isReady, children }: StudyLoadingBoundaryProps) {
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
