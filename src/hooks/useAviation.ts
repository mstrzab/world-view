import { useState, useEffect, useCallback, useRef } from 'react';

interface Aircraft {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  baroAltitude: number;
  onGround: boolean;
  velocity: number;
  trueTrack: number;
  verticalRate: number;
  squawk: string;
}

interface AviationData {
  success: boolean;
  timestamp: string;
  count: number;
  aircraft: Aircraft[];
  source?: string;
}

export function useAviation(enabled: boolean = true, refreshInterval: number = 10000) {
  const [data, setData] = useState<AviationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/aviation');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Failed to fetch aviation data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

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
