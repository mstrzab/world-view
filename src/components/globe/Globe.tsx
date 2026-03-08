'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for Cesium to handle SSR
const GlobeInner = dynamic(() => import('./GlobeInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-lg mb-4 animate-pulse">INITIALIZING GLOBE</div>
        <div className="w-48 h-1 bg-cyan-900/50 mx-auto overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '60%' }} />
        </div>
        <div className="text-gray-500 text-xs mt-4 font-mono">Loading CesiumJS...</div>
      </div>
    </div>
  ),
});

interface GlobeProps {
  visualMode: 'normal' | 'crt' | 'nightVision' | 'thermal';
  onViewerReady?: (viewer: unknown) => void;
}

export default function Globe(props: GlobeProps) {
  return <GlobeInner {...props} />;
}
