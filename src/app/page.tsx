'use client';

import { useState, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import * as Cesium from 'cesium';

// Dynamic imports for components that need client-side only rendering
const Globe = dynamic(() => import('@/components/globe/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="text-cyan-400 font-mono text-lg mb-4">INITIALIZING GLOBE</div>
        <div className="w-48 h-1 bg-cyan-900/50 mx-auto overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '60%' }} />
        </div>
        <div className="text-gray-500 text-xs mt-4 font-mono">Loading terrain data...</div>
      </div>
    </div>
  ),
});

const SidePanel = dynamic(() => import('@/components/dashboard/SidePanel'), { ssr: false });
const TimelineScrubber = dynamic(() => import('@/components/dashboard/TimelineScrubber'), { ssr: false });
const SatelliteLayer = dynamic(() => import('@/components/layers/SatelliteLayer'), { ssr: false });
const AviationLayer = dynamic(() => import('@/components/layers/AviationLayer'), { ssr: false });
const TrafficLayer = dynamic(() => import('@/components/layers/TrafficLayer'), { ssr: false });
const CCTVLayer = dynamic(() => import('@/components/layers/CCTVLayer'), { ssr: false });

import { useSatellites } from '@/hooks/useSatellites';
import { useAviation } from '@/hooks/useAviation';
import { useTraffic } from '@/hooks/useTraffic';
import { useTimeline } from '@/hooks/useTimeline';

interface LayerState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  count: number;
  lastUpdate: Date | null;
}

const INITIAL_LAYER_STATE: Record<string, LayerState> = {
  satellites: { enabled: false, loading: false, error: null, count: 0, lastUpdate: null },
  aviation: { enabled: false, loading: false, error: null, count: 0, lastUpdate: null },
  traffic: { enabled: false, loading: false, error: null, count: 0, lastUpdate: null },
  cctv: { enabled: false, loading: false, error: null, count: 0, lastUpdate: null },
};

export default function Home() {
  // Viewer state
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  
  // Visual mode state
  const [visualMode, setVisualMode] = useState<'normal' | 'crt' | 'nightVision' | 'thermal'>('normal');
  
  // Layer enabled states
  const [enabledLayers, setEnabledLayers] = useState<Record<string, boolean>>({
    satellites: false,
    aviation: false,
    traffic: false,
    cctv: false,
  });
  
  // Layer opacity
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({
    satellites: 0.8,
    aviation: 0.8,
    traffic: 0.7,
    cctv: 0.9,
  });
  
  // Traffic city selection
  const [selectedCity, setSelectedCity] = useState('new-york');
  
  // Timeline
  const timeline = useTimeline();
  
  // Data hooks - these manage their own loading/error states
  const satellitesData = useSatellites(enabledLayers.satellites, 30000);
  const aviationData = useAviation(enabledLayers.aviation, 10000);
  const trafficData = useTraffic(enabledLayers.traffic, selectedCity, 15000);
  
  // Compute derived layer state from hooks
  const layers = useMemo<Record<string, LayerState>>(() => ({
    satellites: {
      enabled: enabledLayers.satellites,
      loading: satellitesData.loading,
      error: satellitesData.error,
      count: satellitesData.data?.count ?? 0,
      lastUpdate: satellitesData.data ? new Date() : null,
    },
    aviation: {
      enabled: enabledLayers.aviation,
      loading: aviationData.loading,
      error: aviationData.error,
      count: aviationData.data?.count ?? 0,
      lastUpdate: aviationData.data ? new Date() : null,
    },
    traffic: {
      enabled: enabledLayers.traffic,
      loading: trafficData.loading,
      error: trafficData.error,
      count: trafficData.data?.stats?.totalVehicles ?? 0,
      lastUpdate: trafficData.data ? new Date() : null,
    },
    cctv: {
      enabled: enabledLayers.cctv,
      loading: false,
      error: null,
      count: enabledLayers.cctv ? 8 : 0,
      lastUpdate: enabledLayers.cctv ? new Date() : null,
    },
  }), [
    enabledLayers,
    satellitesData.loading,
    satellitesData.error,
    satellitesData.data,
    aviationData.loading,
    aviationData.error,
    aviationData.data,
    trafficData.loading,
    trafficData.error,
    trafficData.data,
  ]);
  
  // Handle viewer ready
  const handleViewerReady = useCallback((v: Cesium.Viewer) => {
    setViewer(v);
  }, []);
  
  // Toggle layer
  const toggleLayer = useCallback((layer: string) => {
    setEnabledLayers(prev => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);
  
  // Handle opacity changes
  const handleOpacityChange = useCallback((layer: string, value: number) => {
    setLayerOpacity(prev => ({ ...prev, [layer]: value }));
  }, []);
  
  // Handle progress change for timeline
  const handleProgressChange = useCallback((progress: number) => {
    const timeRange = timeline.endTime.getTime() - timeline.startTime.getTime();
    const newTime = new Date(timeline.startTime.getTime() + (progress / 100) * timeRange);
    timeline.updateCurrentTime(newTime);
  }, [timeline]);

  // Compute loading state
  const isLoading = satellitesData.loading || aviationData.loading || trafficData.loading;
  const loadingMessage = satellitesData.loading 
    ? 'LOADING SATELLITES...' 
    : aviationData.loading 
      ? 'LOADING AVIATION...' 
      : trafficData.loading 
        ? 'LOADING TRAFFIC...' 
        : '';

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0a0f] flex">
      {/* Side Panel */}
      <Suspense fallback={<div className="w-72 bg-[#0a0a0f] border-r border-cyan-900/50" />}>
        <SidePanel
          layers={layers}
          onLayerToggle={toggleLayer}
          visualMode={visualMode}
          onVisualModeChange={(mode) => setVisualMode(mode as typeof visualMode)}
          layerOpacity={layerOpacity}
          onOpacityChange={handleOpacityChange}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />
      </Suspense>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Globe Container */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
              <div className="text-cyan-400 font-mono animate-pulse">Loading Globe...</div>
            </div>
          }>
            <Globe visualMode={visualMode} onViewerReady={handleViewerReady} />
            
            {/* Data Layers */}
            {viewer && (
              <>
                <SatelliteLayer
                  viewer={viewer}
                  satellites={satellitesData.data?.satellites || []}
                  visible={enabledLayers.satellites}
                  opacity={layerOpacity.satellites}
                />
                <AviationLayer
                  viewer={viewer}
                  aircraft={aviationData.data?.aircraft || []}
                  visible={enabledLayers.aviation}
                  opacity={layerOpacity.aviation}
                />
                <TrafficLayer
                  viewer={viewer}
                  vehicles={trafficData.data?.vehicles || []}
                  roads={trafficData.data?.roads || []}
                  visible={enabledLayers.traffic}
                  opacity={layerOpacity.traffic}
                />
                <CCTVLayer
                  viewer={viewer}
                  visible={enabledLayers.cctv}
                  opacity={layerOpacity.cctv}
                />
              </>
            )}
          </Suspense>
        </div>
        
        {/* Timeline Scrubber */}
        <Suspense fallback={<div className="h-24 bg-[#0a0a0f] border-t border-cyan-900/50" />}>
          <TimelineScrubber
            currentTime={timeline.currentTime}
            startTime={timeline.startTime}
            endTime={timeline.endTime}
            isPlaying={timeline.isPlaying}
            playbackSpeed={timeline.playbackSpeed}
            progress={timeline.progress}
            onPlayPause={timeline.togglePlayPause}
            onSpeedChange={timeline.setPlaybackSpeed}
            onProgressChange={handleProgressChange}
            onJumpToStart={timeline.jumpToStart}
            onJumpToEnd={timeline.jumpToEnd}
            onStepForward={timeline.stepForward}
            onStepBackward={timeline.stepBackward}
          />
        </Suspense>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed bottom-32 right-4 bg-[#0a0a0f]/90 backdrop-blur-sm border border-cyan-900/50 rounded p-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-cyan-400 text-xs font-mono">{loadingMessage}</span>
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="fixed top-4 left-80 flex items-center gap-2 pointer-events-none">
        {Object.entries(layers).map(([key, layer]) => (
          layer.enabled && (
            <div key={key} className="flex items-center gap-1 bg-[#0a0a0f]/80 px-2 py-1 rounded text-xs font-mono">
              <div className={`w-1.5 h-1.5 rounded-full ${layer.error ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
              <span className="text-gray-400 uppercase">{key}</span>
            </div>
          )
        ))}
      </div>
    </main>
  );
}
