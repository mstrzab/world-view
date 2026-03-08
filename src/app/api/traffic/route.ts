import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'new-york';
    
    // Generate simulated traffic data for major cities
    const trafficData = generateTrafficData(city);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      city,
      vehicles: trafficData.vehicles,
      roads: trafficData.roads,
      stats: {
        totalVehicles: trafficData.vehicles.length,
        averageSpeed: trafficData.vehicles.reduce((acc, v) => acc + v.speed, 0) / trafficData.vehicles.length,
        congestedRoads: trafficData.roads.filter(r => r.density > 0.7).length,
      },
    });
  } catch (error) {
    console.error('Traffic fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch traffic data',
    });
  }
}

function generateTrafficData(city: string): { vehicles: TrafficPoint[]; roads: RoadSegment[] } {
  const cityConfigs: Record<string, { center: [number, number]; radius: number }> = {
    'new-york': { center: [40.7128, -74.006], radius: 0.15 },
    'london': { center: [51.5074, -0.1278], radius: 0.12 },
    'tokyo': { center: [35.6762, 139.6503], radius: 0.15 },
    'paris': { center: [48.8566, 2.3522], radius: 0.1 },
    'sydney': { center: [-33.8688, 151.2093], radius: 0.12 },
    'dubai': { center: [25.2048, 55.2708], radius: 0.1 },
  };
  
  const config = cityConfigs[city] || cityConfigs['new-york'];
  const vehicles: TrafficPoint[] = [];
  const roads: RoadSegment[] = [];
  
  // Generate vehicles
  const vehicleCount = 150;
  for (let i = 0; i < vehicleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * config.radius;
    
    vehicles.push({
      id: `v-${i}`,
      lat: config.center[0] + Math.cos(angle) * distance,
      lon: config.center[1] + Math.sin(angle) * distance,
      speed: 20 + Math.random() * 80,
      heading: Math.random() * 360,
      type: ['car', 'car', 'car', 'truck', 'bus'][Math.floor(Math.random() * 5)] as 'car' | 'truck' | 'bus',
    });
  }
  
  // Generate road segments (simulated major roads)
  const roadCount = 20;
  for (let i = 0; i < roadCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const startDistance = Math.random() * config.radius * 0.5;
    const endDistance = startDistance + 0.02 + Math.random() * 0.05;
    
    roads.push({
      id: `r-${i}`,
      name: `${city.toUpperCase()}-${i}`,
      startLat: config.center[0] + Math.cos(angle) * startDistance,
      startLon: config.center[1] + Math.sin(angle) * startDistance,
      endLat: config.center[0] + Math.cos(angle + Math.random() * 0.3) * endDistance,
      endLon: config.center[1] + Math.sin(angle + Math.random() * 0.3) * endDistance,
      density: Math.random(),
    });
  }
  
  return { vehicles, roads };
}
