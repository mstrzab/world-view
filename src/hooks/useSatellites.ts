import { useState, useEffect, useCallback, useRef } from 'react';

interface Satellite {
  name: string;
  tleLine1: string;
  tleLine2: string;
  noradId: string;
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

interface SatelliteData {
  success: boolean;
  timestamp: string;
  count: number;
  satellites: Satellite[];
  source?: string;
}

export function useSatellites(enabled: boolean = true, refreshInterval: number = 30000) {
  const [data, setData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/satellites');
      const result = await response.json();
      
      if (result.success) {
        // Calculate satellite positions using TLE data
        const satellitesWithPositions = await calculatePositions(result.satellites);
        setData({ ...result, satellites: satellitesWithPositions });
      } else {
        setError('Failed to fetch satellite data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  // Simple position calculation (for demo purposes)
  // Real implementation would use satellite.js library
  const calculatePositions = async (satellites: Satellite[]): Promise<Satellite[]> => {
    const now = new Date();
    
    return satellites.map((sat, index) => {
      // Generate pseudo-random but consistent positions based on NORAD ID
      const seed = parseInt(sat.noradId) || index;
      const period = 90 + (seed % 30); // Orbital period in minutes
      const inclination = 20 + (seed % 70); // 20-90 degrees
      const phase = ((now.getTime() / 1000 / 60) % period) / period;
      
      // Calculate position (simplified)
      const longitude = (phase * 360 - 180 + (seed % 360)) % 360 - 180;
      const latitude = inclination * Math.sin(phase * Math.PI * 2);
      const altitude = 400 + (seed % 200); // 400-600 km altitude
      
      return {
        ...sat,
        position: {
          latitude,
          longitude,
          altitude: altitude * 1000, // Convert to meters
        },
      };
    });
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refreshInterval, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
