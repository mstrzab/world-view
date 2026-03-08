import { NextResponse } from 'next/server';

interface AircraftState {
  icao24: string;
  callsign: string;
  originCountry: string;
  timePosition: number;
  lastContact: number;
  longitude: number;
  latitude: number;
  baroAltitude: number;
  onGround: boolean;
  velocity: number;
  trueTrack: number;
  verticalRate: number;
  sensors: number[];
  geoAltitude: number;
  squawk: string;
  spi: boolean;
  positionSource: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');
    
    let url = 'https://opensky-network.org/api/states/all';
    
    // If bounds provided, filter by bounding box
    if (bounds) {
      // bounds format: lamin,lomin,lamax,lomax
      url = `https://opensky-network.org/api/states/all?bbox=${bounds}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform OpenSky response to our format
    const aircraft: AircraftState[] = (data.states || []).slice(0, 200).map((state: unknown[]) => ({
      icao24: state[0] as string,
      callsign: (state[1] as string)?.trim() || 'N/A',
      originCountry: state[2] as string,
      timePosition: state[3] as number,
      lastContact: state[4] as number,
      longitude: state[5] as number,
      latitude: state[6] as number,
      baroAltitude: state[7] as number,
      onGround: state[8] as boolean,
      velocity: state[9] as number,
      trueTrack: state[10] as number,
      verticalRate: state[11] as number,
      sensors: state[12] as number[],
      geoAltitude: state[13] as number,
      squawk: state[14] as string,
      spi: state[15] as boolean,
      positionSource: state[16] as number,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      time: data.time,
      count: aircraft.length,
      aircraft,
    });
  } catch (error) {
    console.error('Aviation fetch error:', error);
    
    // Return mock data if API fails
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: 50,
      aircraft: generateMockAircraft(50),
      source: 'mock',
    });
  }
}

function generateMockAircraft(count: number) {
  const aircraft = [];
  const airlines = ['UAL', 'DAL', 'AAL', 'SWA', 'JBU', 'BAW', 'DLH', 'AFR', 'JAL', 'ANA'];
  
  for (let i = 0; i < count; i++) {
    // Generate random positions around the world
    const lat = (Math.random() - 0.5) * 140;
    const lon = (Math.random() - 0.5) * 360;
    const altitude = Math.random() * 12000 + 1000;
    const velocity = Math.random() * 200 + 200;
    
    aircraft.push({
      icao24: `${Math.random().toString(36).substring(2, 8)}`,
      callsign: `${airlines[i % airlines.length]}${Math.floor(Math.random() * 9000) + 100}`,
      originCountry: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan'][i % 5],
      timePosition: Date.now() / 1000,
      lastContact: Date.now() / 1000,
      longitude: lon,
      latitude: lat,
      baroAltitude: altitude,
      onGround: false,
      velocity,
      trueTrack: Math.random() * 360,
      verticalRate: (Math.random() - 0.5) * 20,
      sensors: [],
      geoAltitude: altitude,
      squawk: `${Math.floor(Math.random() * 7000) + 1000}`,
      spi: false,
      positionSource: 0,
    });
  }
  
  return aircraft;
}
