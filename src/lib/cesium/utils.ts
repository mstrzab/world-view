import * as Cesium from 'cesium';

// Initialize Cesium Ion token
export const initCesium = () => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQxMjVhYy1hNDJjLTRhNDEtODI0ZC05Y2IyN2JhMzVjNjUiLCJpZCI6MjU5LCJpYXQiOjE3MzQwNTI5MjV9.SdVVzxh3L6HKcMk_xYzZ-8GwZf3NbBKwxGjLhXqFYKI';
};

// Convert latitude, longitude, altitude to Cartesian3
export const latLonToCartesian = (
  latitude: number,
  longitude: number,
  altitude: number = 0
): Cesium.Cartesian3 => {
  return Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
};

// Convert Cartesian3 to latitude, longitude, altitude
export const cartesianToLatLon = (
  cartesian: Cesium.Cartesian3
): { latitude: number; longitude: number; altitude: number } => {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  return {
    latitude: Cesium.Math.toDegrees(cartographic.latitude),
    longitude: Cesium.Math.toDegrees(cartographic.longitude),
    altitude: cartographic.height,
  };
};

// Create a point entity with glow effect
export const createGlowingPoint = (
  id: string,
  position: Cesium.Cartesian3,
  color: Cesium.Color,
  pixelSize: number = 8,
  glowIntensity: number = 2.0
): Cesium.Entity => {
  return new Cesium.Entity({
    id,
    position,
    point: {
      pixelSize,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.5, 1.5e7, 0.3),
      translucencyByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.1),
    },
    billboard: {
      image: createGlowCanvas(color, pixelSize * glowIntensity),
      scale: 1.0,
      scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.5, 1.5e7, 0.5),
      translucencyByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.1),
    },
  });
};

// Create a canvas with glow effect for billboards
export const createGlowCanvas = (color: Cesium.Color, size: number = 32): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 4;
    
    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2);
    gradient.addColorStop(0, `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 1)`);
    gradient.addColorStop(0.3, `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 0.8)`);
    gradient.addColorStop(0.6, `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 0.3)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  
  return canvas;
};

// Create a polyline for orbital paths or flight trails
export const createOrbitPath = (
  positions: Cesium.Cartesian3[],
  color: Cesium.Color,
  width: number = 1.5
): Cesium.Entity => {
  return new Cesium.Entity({
    polyline: {
      positions,
      width,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        taperPower: 1,
        color,
      }),
    },
  });
};

// Create aircraft model or icon
export const createAircraftEntity = (
  id: string,
  position: Cesium.Cartesian3,
  heading: number = 0,
  pitch: number = 0
): Cesium.Entity => {
  return new Cesium.Entity({
    id,
    position,
    billboard: {
      image: createAircraftCanvas(),
      scale: 0.5,
      rotation: Cesium.Math.toRadians(heading),
      alignedAxis: Cesium.Cartesian3.UNIT_Z,
      scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 1.5e7, 0.3),
    },
  });
};

// Create aircraft icon canvas
export const createAircraftCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#00ffff';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    
    // Draw aircraft shape
    ctx.beginPath();
    ctx.moveTo(32, 5);
    ctx.lineTo(42, 55);
    ctx.lineTo(32, 45);
    ctx.lineTo(22, 55);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.beginPath();
    ctx.moveTo(10, 35);
    ctx.lineTo(54, 35);
    ctx.lineTo(32, 45);
    ctx.closePath();
    ctx.fill();
  }
  
  return canvas;
};

// Camera fly-to animation
export const flyToLocation = (
  viewer: Cesium.Viewer,
  latitude: number,
  longitude: number,
  altitude: number,
  duration: number = 2.0
): Promise<void> => {
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration,
      complete: () => resolve(),
    });
  });
};

// Generate orbital path positions for a satellite
export const generateOrbitPath = (
  tleLine1: string,
  tleLine2: string,
  pointsCount: number = 100
): Cesium.Cartesian3[] => {
  // This will be populated by the satellite.js library
  // For now, return empty array - actual calculation done in the layer component
  return [];
};
