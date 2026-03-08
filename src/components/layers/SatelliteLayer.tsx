'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

interface SatelliteData {
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

interface SatelliteLayerProps {
  viewer: Cesium.Viewer | null;
  satellites: SatelliteData[];
  visible: boolean;
  opacity: number;
}

export default function SatelliteLayer({ viewer, satellites, visible, opacity }: SatelliteLayerProps) {
  const entitiesRef = useRef<Cesium.Entity[]>([]);

  useEffect(() => {
    if (!viewer) return;

    // Clear existing entities
    entitiesRef.current.forEach(entity => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current = [];

    if (!visible || satellites.length === 0) return;

    // Create entities for each satellite
    satellites.forEach((satellite, index) => {
      if (!satellite.position) return;

      const position = Cesium.Cartesian3.fromDegrees(
        satellite.position.longitude,
        satellite.position.latitude,
        satellite.position.altitude
      );

      // Create glowing point for satellite
      const entity = viewer.entities.add({
        id: `satellite-${satellite.noradId}`,
        position,
        point: {
          pixelSize: 6,
          color: Cesium.Color.PURPLE.withAlpha(opacity),
          outlineColor: Cesium.Color.WHITE.withAlpha(opacity * 0.5),
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.5, 1.5e7, 0.5),
        },
        label: {
          text: satellite.name.substring(0, 15),
          font: '10px monospace',
          fillColor: Cesium.Color.CYAN.withAlpha(opacity),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.3),
        },
        // Add a trail effect
        path: {
          resolution: 60,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.PURPLE.withAlpha(opacity * 0.5),
          }),
          width: 1,
          leadTime: 0,
          trailTime: 45 * 60, // 45 minutes trail
        },
      });

      entitiesRef.current.push(entity);

      // Create orbital path (simplified - just show the ground track)
      if (index < 20) { // Limit to first 20 for performance
        const orbitPoints = generateOrbitPoints(satellite, 100);
        const orbitEntity = viewer.entities.add({
          id: `orbit-${satellite.noradId}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(orbitPoints),
            width: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1,
              color: Cesium.Color.PURPLE.withAlpha(opacity * 0.3),
            }),
          },
        });
        entitiesRef.current.push(orbitEntity);
      }
    });

    return () => {
      entitiesRef.current.forEach(entity => {
        viewer.entities.remove(entity);
      });
      entitiesRef.current = [];
    };
  }, [viewer, satellites, visible, opacity]);

  return null;
}

// Generate orbit path points for visualization
function generateOrbitPoints(satellite: SatelliteData, numPoints: number): number[] {
  const points: number[] = [];
  
  if (!satellite.position) return points;
  
  const baseLat = satellite.position.latitude;
  const baseLon = satellite.position.longitude;
  const altitude = satellite.position.altitude;
  
  // Create a simplified orbital arc
  for (let i = 0; i < numPoints; i++) {
    const progress = i / numPoints;
    const angle = progress * Math.PI * 2;
    
    // Simplified orbital movement
    const lon = ((baseLon + progress * 180 + 180) % 360) - 180;
    const lat = baseLat * Math.cos(angle * 3);
    
    points.push(lon, lat, altitude);
  }
  
  return points;
}
