'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

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

interface AviationLayerProps {
  viewer: Cesium.Viewer | null;
  aircraft: Aircraft[];
  visible: boolean;
  opacity: number;
}

export default function AviationLayer({ viewer, aircraft, visible, opacity }: AviationLayerProps) {
  const entitiesRef = useRef<Cesium.Entity[]>([]);

  useEffect(() => {
    if (!viewer) return;

    // Clear existing entities
    entitiesRef.current.forEach(entity => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current = [];

    if (!visible || aircraft.length === 0) return;

    // Create entities for each aircraft
    aircraft.forEach((plane) => {
      if (!plane.latitude || !plane.longitude) return;

      const position = Cesium.Cartesian3.fromDegrees(
        plane.longitude,
        plane.latitude,
        plane.baroAltitude || 10000
      );

      // Determine color based on altitude
      let color = Cesium.Color.CYAN;
      if (plane.baroAltitude) {
        if (plane.baroAltitude > 10000) {
          color = Cesium.Color.fromCssColorString('#00ffff'); // High altitude - cyan
        } else if (plane.baroAltitude > 5000) {
          color = Cesium.Color.fromCssColorString('#00ff88'); // Medium - green-cyan
        } else {
          color = Cesium.Color.fromCssColorString('#ffff00'); // Low - yellow
        }
      }

      // Grounded aircraft are gray
      if (plane.onGround) {
        color = Cesium.Color.GRAY;
      }

      const entity = viewer.entities.add({
        id: `aircraft-${plane.icao24}`,
        position,
        billboard: {
          image: createAircraftIcon(),
          scale: 0.4,
          rotation: Cesium.Math.toRadians(-(plane.trueTrack || 0)),
          alignedAxis: Cesium.Cartesian3.UNIT_Z,
          color: color.withAlpha(opacity),
          scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.3),
        },
        label: {
          text: plane.callsign || plane.icao24,
          font: '10px monospace',
          fillColor: Cesium.Color.CYAN.withAlpha(opacity),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 15),
          scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.3),
        },
        // Flight trail
        path: {
          resolution: 60,
          material: color.withAlpha(opacity * 0.3),
          width: 1,
          leadTime: 0,
          trailTime: 10 * 60, // 10 minutes trail
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
  }, [viewer, aircraft, visible, opacity]);

  return null;
}

// Create aircraft icon as canvas
function createAircraftIcon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    
    // Draw aircraft shape
    ctx.beginPath();
    ctx.moveTo(32, 5);
    ctx.lineTo(38, 50);
    ctx.lineTo(32, 45);
    ctx.lineTo(26, 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Wings
    ctx.beginPath();
    ctx.moveTo(8, 32);
    ctx.lineTo(56, 32);
    ctx.lineTo(32, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(24, 50);
    ctx.lineTo(40, 50);
    ctx.lineTo(32, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  return canvas.toDataURL();
}
