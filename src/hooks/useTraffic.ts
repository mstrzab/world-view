import { useState, useEffect, useCallback, useRef } from 'react';

interface TrafficPoint {
  id: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  type: 'car' | 'truck' | 'bus';
}

interface RoadSegment {
  id: string;
  name: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  density: number;
}

interface TrafficData {
  success: boolean;
  timestamp: string;
  city: string;
  vehicles: TrafficPoint[];
  roads: RoadSegment[];
  stats: {
    totalVehicles: number;
    averageSpeed: number;
    congestedRoads: number;
  };
}

export function useTraffic(enabled: boolean = true, city: string = 'new-york', refreshInterval: number = 15000) {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/traffic?city=${city}`);
      const result = await response.json();
      
      if (result.success) {
        // Update vehicle positions for animation
        const updatedVehicles = result.vehicles.map((vehicle: TrafficPoint) => ({
          ...vehicle,
          lat: vehicle.lat + (Math.random() - 0.5) * 0.001,
          lon: vehicle.lon + (Math.random() - 0.5) * 0.001,
          heading: (vehicle.heading + (Math.random() - 0.5) * 10) % 360,
        }));
        
        setData({ ...result, vehicles: updatedVehicles });
      } else {
        setError('Failed to fetch traffic data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled, city]);

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
