import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch TLE data from Celestrak
    const response = await fetch(
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle&LIMIT=50',
      {
        headers: {
          'Accept': 'text/plain',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Celestrak API error: ${response.status}`);
    }

    const tleText = await response.text();
    const lines = tleText.split('\n').filter(line => line.trim() !== '');
    
    // Parse TLE data into objects
    const satellites: Array<{
      name: string;
      tleLine1: string;
      tleLine2: string;
      noradId: string;
    }> = [];
    
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const name = lines[i].trim();
        const tleLine1 = lines[i + 1].trim();
        const tleLine2 = lines[i + 2].trim();
        
        // Extract NORAD ID from TLE line 1 (positions 2-7)
        const noradId = tleLine1.substring(2, 7).trim();
        
        satellites.push({
          name,
          tleLine1,
          tleLine2,
          noradId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: satellites.length,
      satellites,
    });
  } catch (error) {
    console.error('Satellite fetch error:', error);
    
    // Return mock data if API fails
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: 10,
      satellites: generateMockSatellites(10),
      source: 'mock',
    });
  }
}

function generateMockSatellites(count: number) {
  const satellites = [];
  const names = [
    'ISS (ZARYA)', 'HST', 'LANDSAT-8', 'SENTINEL-1A', 'WORLDVIEW-3',
    'TERRA', 'AQUA', 'NOAA-19', 'GOES-16', 'STARLINK-1234'
  ];
  
  for (let i = 0; i < count; i++) {
    const noradId = 10000 + i * 100;
    satellites.push({
      name: names[i] || `SATELLITE-${noradId}`,
      noradId: String(noradId),
      tleLine1: `1 ${noradId}U 20001A   24001.00000000  .00000000  00000-0  00000-0 0  0000`,
      tleLine2: `2 ${noradId} 051.0000 100.0000 0000000 200.0000 100.0000 15.00000000000000`,
    });
  }
  
  return satellites;
}
