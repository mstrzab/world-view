'use client';

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, VideoOff } from 'lucide-react';

interface CCTVLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altitude: number;
}

interface CCTVLayerProps {
  viewer: Cesium.Viewer | null;
  visible: boolean;
  opacity: number;
}

const CCTV_LOCATIONS: CCTVLocation[] = [
  { id: 'NYC-TIMES', name: 'Times Square, NYC', lat: 40.7580, lon: -73.9855, altitude: 50 },
  { id: 'LON-BIG', name: 'Big Ben, London', lat: 51.5007, lon: -0.1246, altitude: 45 },
  { id: 'TOK-SHIB', name: 'Shibuya Crossing, Tokyo', lat: 35.6595, lon: 139.7004, altitude: 30 },
  { id: 'SYD-OPERA', name: 'Opera House, Sydney', lat: -33.8568, lon: 151.2153, altitude: 40 },
  { id: 'PAR-EIFFEL', name: 'Eiffel Tower, Paris', lat: 48.8584, lon: 2.2945, altitude: 80 },
  { id: 'DUB-BURJ', name: 'Burj Khalifa, Dubai', lat: 25.1972, lon: 55.2744, altitude: 200 },
  { id: 'HK-VIC', name: 'Victoria Harbour, HK', lat: 22.2855, lon: 114.1577, altitude: 40 },
  { id: 'SIN-MARINA', name: 'Marina Bay, Singapore', lat: 1.2834, lon: 103.8607, altitude: 35 },
];

export default function CCTVLayer({ viewer, visible, opacity }: CCTVLayerProps) {
  const entitiesRef = useRef<Cesium.Entity[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CCTVLocation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!viewer) return;

    // Clear existing entities
    entitiesRef.current.forEach(entity => {
      viewer.entities.remove(entity);
    });
    entitiesRef.current = [];

    if (!visible) return;

    // Create camera entities
    CCTV_LOCATIONS.forEach((camera) => {
      const position = Cesium.Cartesian3.fromDegrees(
        camera.lon,
        camera.lat,
        camera.altitude
      );

      const entity = viewer.entities.add({
        id: `cctv-${camera.id}`,
        position,
        billboard: {
          image: createCameraIcon(),
          scale: 0.6,
          color: Cesium.Color.RED.withAlpha(opacity),
          scaleByDistance: new Cesium.NearFarScalar(1.5e5, 1.5, 1.5e7, 0.5),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        label: {
          text: camera.name,
          font: '10px monospace',
          fillColor: Cesium.Color.RED.withAlpha(opacity),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          scaleByDistance: new Cesium.NearFarScalar(1.5e5, 1.0, 1.5e7, 0.3),
        },
        // Add a cone showing camera view direction
        ellipse: {
          semiMinorAxis: 200,
          semiMajorAxis: 300,
          material: Cesium.Color.RED.withAlpha(opacity * 0.2),
          outline: true,
          outlineColor: Cesium.Color.RED.withAlpha(opacity * 0.5),
          outlineWidth: 2,
          height: camera.altitude - 10,
        },
      });

      entitiesRef.current.push(entity);
    });

    // Add click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
        const entityId = pickedObject.id.id;
        if (typeof entityId === 'string' && entityId.startsWith('cctv-')) {
          const cameraId = entityId.replace('cctv-', '');
          const camera = CCTV_LOCATIONS.find(c => c.id === cameraId);
          if (camera) {
            setSelectedCamera(camera);
            setDialogOpen(true);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      entitiesRef.current.forEach(entity => {
        viewer.entities.remove(entity);
      });
      entitiesRef.current = [];
      handler.destroy();
    };
  }, [viewer, visible, opacity]);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a0a0f] border-red-900/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-mono flex items-center gap-2">
              <Video className="w-5 h-5" />
              CCTV FEED: {selectedCamera?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Simulated camera feed */}
            <div className="aspect-video bg-black border border-red-900/50 rounded relative overflow-hidden">
              {/* Simulated CCTV feed with static/noise */}
              <div 
                className="absolute inset-0 opacity-50"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
              
              {/* Camera info overlay */}
              <div className="absolute top-2 left-2 text-red-500 font-mono text-xs">
                <div>REC ● {new Date().toLocaleTimeString()}</div>
                <div>CAM: {selectedCamera?.id}</div>
              </div>
              
              <div className="absolute top-2 right-2 text-red-500 font-mono text-xs">
                <div>LAT: {selectedCamera?.lat.toFixed(4)}°</div>
                <div>LON: {selectedCamera?.lon.toFixed(4)}°</div>
              </div>
              
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-20 h-20">
                  <div className="absolute top-0 left-1/2 w-px h-6 bg-red-500/50 -translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-px h-6 bg-red-500/50 -translate-x-1/2" />
                  <div className="absolute left-0 top-1/2 w-6 h-px bg-red-500/50 -translate-y-1/2" />
                  <div className="absolute right-0 top-1/2 w-6 h-px bg-red-500/50 -translate-y-1/2" />
                </div>
              </div>
              
              {/* "NO SIGNAL" message */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 font-mono text-xl opacity-50">
                  LIVE FEED - SIMULATION
                </div>
              </div>
            </div>
            
            {/* Camera controls */}
            <div className="flex gap-2">
              <Button variant="outline" className="border-red-800 text-red-400 flex-1">
                <Video className="w-4 h-4 mr-2" />
                RECORDING
              </Button>
              <Button variant="outline" className="border-red-800 text-red-400 flex-1">
                <VideoOff className="w-4 h-4 mr-2" />
                STOP
              </Button>
            </div>
            
            {/* Perspective controls */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#111] p-2 rounded border border-red-900/30">
                <div className="text-red-400 mb-1">PAN</div>
                <div className="text-gray-500">← → ↑ ↓</div>
              </div>
              <div className="bg-[#111] p-2 rounded border border-red-900/30">
                <div className="text-red-400 mb-1">ZOOM</div>
                <div className="text-gray-500">+ / -</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Create camera icon as canvas
function createCameraIcon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Camera body
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(12, 20, 40, 28);
    
    // Camera lens
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.arc(32, 34, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Lens reflection
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.arc(29, 31, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Mount/pole
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(28, 48, 8, 16);
    
    // Status LED
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(48, 24, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas.toDataURL();
}
