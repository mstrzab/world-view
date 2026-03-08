'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

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

interface TrafficLayerProps {
  viewer: Cesium.Viewer | null;
  vehicles: TrafficPoint[];
  roads: RoadSegment[];
  visible: boolean;
  opacity: number;
}

export default function TrafficLayer({ viewer, vehicles, roads, visible, opacity }: TrafficLayerProps) {
  const entitiesRef = useRef<Cesium.Entity[]>([]);

  useEffect(() => {
    if (!viewer) return;

    // Clear existing entities
    entitiesRef.current.forEach(entity => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current = [];

    if (!visible) return;

    // Create road segments
    roads.forEach((road) => {
      const color = road.density > 0.7 
        ? Cesium.Color.RED.withAlpha(opacity * 0.8) // Congested
        : road.density > 0.4 
          ? Cesium.Color.YELLOW.withAlpha(opacity * 0.6) // Moderate
          : Cesium.Color.GREEN.withAlpha(opacity * 0.4); // Clear

      const entity = viewer.entities.add({
        id: `road-${road.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            road.startLon, road.startLat,
            road.endLon, road.endLat,
          ]),
          width: 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color,
          }),
          clampToGround: true,
        },
      });

      entitiesRef.current.push(entity);
    });

    // Create vehicle particles
    vehicles.forEach((vehicle) => {
      // Color based on speed
      let color = Cesium.Color.GREEN;
      if (vehicle.speed < 30) {
        color = Cesium.Color.RED; // Slow/stopped
      } else if (vehicle.speed < 60) {
        color = Cesium.Color.YELLOW; // Medium
      }

      // Size based on vehicle type
      let size = 4;
      if (vehicle.type === 'truck') size = 5;
      if (vehicle.type === 'bus') size = 6;

      const position = Cesium.Cartesian3.fromDegrees(
        vehicle.lon,
        vehicle.lat,
        50 // Slightly above ground
      );

      const entity = viewer.entities.add({
        id: `vehicle-${vehicle.id}`,
        position,
        point: {
          pixelSize: size,
          color: color.withAlpha(opacity),
          outlineColor: Cesium.Color.WHITE.withAlpha(opacity * 0.3),
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1.5e4, 1.5, 1.5e6, 0.5),
        },
      });

      entitiesRef.current.push(entity);
    });

    return () => {
      entitiesRef.current.forEach(entity => {
        viewer.entities.remove(entity);
      });
      entitiesRef.current = [];
    };
  }, [viewer, vehicles, roads, visible, opacity]);

  return null;
}
