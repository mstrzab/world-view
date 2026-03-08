# 🌍 WorldView - Geospatial Intelligence Dashboard

A sophisticated, tactical spy-thriller styled 3D geospatial intelligence dashboard built with Next.js 16, React, and CesiumJS.

![WorldView Dashboard](https://my-project-virid-five-13.vercel.app/)

## 🚀 Live Demo

**Production URL**: https://my-project-virid-five-13.vercel.app/

## ✨ Features

### 🌐 3D Globe Visualization
- Full 3D Earth rendering with CesiumJS
- Realistic terrain and atmospheric effects
- Smooth camera controls and animations
- Sun-position based lighting

### 🎯 Tactical "Spy-Thriller" UI
- Dark military-style theme with cyan/green accents
- HUD-style overlays with coordinate readouts
- Glowing borders, crosshairs, and targeting reticles
- Scanline effects and pulsing status indicators
- Monospace fonts for data displays

### 🎨 WebGL Post-Processing Shaders
- **Normal Mode**: Standard view
- **CRT Monitor**: Scanlines, chromatic aberration, vignette
- **Night Vision**: Green tint, bloom effect, noise grain
- **Thermal/FLIR**: Rainbow heat signature coloring

### 📡 Data Layer Integrations

#### 🛰️ Satellites
- Real-time satellite tracking from NORAD TLE data
- Orbital path visualization
- Glowing satellite points with labels

#### ✈️ Aviation
- Live flight tracking via OpenSky Network API
- Aircraft icons with heading rotation
- Altitude-based color coding
- Flight trail visualization

#### 🚗 Traffic
- Particle system for vehicle simulation
- Road network visualization
- Multiple city support (NYC, London, Tokyo, Paris, Sydney, Dubai)
- Density-based coloring (green/yellow/red)

#### 📹 CCTV
- 8 major landmark camera positions
- Simulated camera feed dialogs
- Click-to-view camera interface

### ⏱️ Timeline Scrubber
- Play/pause controls with animation
- Speed selector (1x, 2x, 4x, 8x, 16x)
- Timeline progress bar with markers
- Historical playback simulation

## 🛠️ Technology Stack

- **Next.js 16** - App Router with Turbopack
- **React 19** - UI components
- **CesiumJS** - 3D globe visualization
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **date-fns** - Date utilities

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tactical theme styles
│   └── api/
│       ├── satellites/route.ts
│       ├── aviation/route.ts
│       └── traffic/route.ts
├── components/
│   ├── globe/
│   │   └── Globe.tsx         # CesiumJS 3D globe
│   ├── dashboard/
│   │   ├── SidePanel.tsx     # Layer controls
│   │   └── TimelineScrubber.tsx
│   ├── layers/
│   │   ├── SatelliteLayer.tsx
│   │   ├── AviationLayer.tsx
│   │   ├── TrafficLayer.tsx
│   │   └── CCTVLayer.tsx
│   └── shaders/
│       └── shaders.ts        # WebGL shader code
├── hooks/
│   ├── useSatellites.ts
│   ├── useAviation.ts
│   ├── useTraffic.ts
│   └── useTimeline.ts
└── lib/
    ├── cesium/utils.ts
    └── constants.ts
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run linting
bun run lint
```

## 🌐 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/satellites` | NORAD TLE satellite data |
| `/api/aviation` | OpenSky Network flight data |
| `/api/traffic` | Simulated traffic data |

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Cesium Ion Token (optional - default token included)
CESIUM_ION_TOKEN=your_token_here
```

## 📦 Deployment

### GitHub Repository
https://github.com/mstrzab/world-view

### Vercel Deployment
The project is configured for automatic deployment on Vercel:

1. Push changes to GitHub
2. Vercel automatically builds and deploys

## 🎮 Controls

- **Left Panel**: Toggle data layers and visual modes
- **Mouse Drag**: Rotate globe
- **Scroll**: Zoom in/out
- **Click on CCTV**: View camera feed
- **Timeline**: Control historical playback

## 📄 License

MIT License

---

Built with ❤️ for geospatial intelligence visualization
