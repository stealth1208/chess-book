'use client';

import { ReactNode } from 'react';

type ChessBookLoadingBoundaryProps = {
  isReady: boolean;
  children: ReactNode;
};

export function ChessBookLoadingBoundary({ isReady, children }: ChessBookLoadingBoundaryProps) {
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
