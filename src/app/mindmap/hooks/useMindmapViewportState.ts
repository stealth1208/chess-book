'use client';

import { useState } from 'react';

export function useMindmapViewportState() {
  const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))));
  const resetZoom = () => setZoom(1);

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
