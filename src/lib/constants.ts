// WorldView Constants

export const CESION_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQxMjVhYy1hNDJjLTRhNDEtODI0ZC05Y2IyN2JhMzVjNjUiLCJpZCI6MjU5LCJpYXQiOjE3MzQwNTI5MjV9.SdVVzxh3L6HKcMk_xYzZ-8GwZf3NbBKwxGjLhXqFYKI';

export const DATA_REFRESH_INTERVALS = {
  satellites: 30000, // 30 seconds
  aviation: 10000, // 10 seconds
  traffic: 15000, // 15 seconds
  cctv: 1000, // 1 second (1fps)
};

export const TLE_SOURCES = {
  active: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
  stations: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  starlink: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
};

export const OPENSKY_API = 'https://opensky-network.org/api';

export const VISUAL_MODES = {
  NORMAL: 'normal',
  CRT: 'crt',
  NIGHT_VISION: 'nightVision',
  THERMAL: 'thermal',
} as const;

export const LAYER_NAMES = {
  SATELLITES: 'satellites',
  AVIATION: 'aviation',
  TRAFFIC: 'traffic',
  CCTV: 'cctv',
} as const;

// Tactical color palette
export const TACTICAL_COLORS = {
  primary: '#00ffff', // Cyan
  secondary: '#00ff00', // Green
  warning: '#ffaa00', // Orange
  danger: '#ff3333', // Red
  background: '#0a0a0f',
  panelBg: '#111111',
  border: '#1a3a3a',
  text: '#cccccc',
  textDim: '#666666',
  glow: 'rgba(0, 255, 255, 0.5)',
};

// Sample CCTV locations (public camera positions)
export const SAMPLE_CCTV_LOCATIONS = [
  { id: 'NYC-TIMES', name: 'Times Square', lat: 40.7580, lon: -73.9855, altitude: 50 },
  { id: 'LON-BIG', name: 'Big Ben', lat: 51.5007, lon: -0.1246, altitude: 45 },
  { id: 'TOK-SHIB', name: 'Shibuya', lat: 35.6595, lon: 139.7004, altitude: 30 },
  { id: 'SYD-OPERA', name: 'Opera House', lat: -33.8568, lon: 151.2153, altitude: 40 },
  { id: 'PAR-EIFFEL', name: 'Eiffel Tower', lat: 48.8584, lon: 2.2945, altitude: 80 },
  { id: 'DUB-BURJ', name: 'Burj Khalifa', lat: 25.1972, lon: 55.2744, altitude: 200 },
];
