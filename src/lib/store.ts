// WorldView Dashboard Store
import { create } from 'zustand';
import { VISUAL_MODES, DATA_LAYERS, type VisualMode, type DataLayer } from '@/lib/constants';

interface LayerState {
  enabled: boolean;
  opacity: number;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  dataCount: number;
}

interface DashboardState {
  // Visual mode
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;

  // Layer states
  layers: Record<DataLayer, LayerState>;
  toggleLayer: (layer: DataLayer) => void;
  setLayerOpacity: (layer: DataLayer, opacity: number) => void;
  setLayerLoading: (layer: DataLayer, loading: boolean) => void;
  setLayerError: (layer: DataLayer, error: string | null) => void;
  setLayerData: (layer: DataLayer, count: number) => void;

  // Timeline
  currentTime: Date;
  isPlaying: boolean;
  playbackSpeed: number;
  setCurrentTime: (time: Date) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;

  // Camera
  cameraPosition: {
    longitude: number;
    latitude: number;
    height: number;
  } | null;
  setCameraPosition: (pos: { longitude: number; latitude: number; height: number }) => void;

  // Selected entity
  selectedEntity: {
    type: DataLayer | null;
    id: string | null;
    data: unknown | null;
  };
  setSelectedEntity: (entity: { type: DataLayer | null; id: string | null; data: unknown | null }) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // CCTV feed
  selectedCCTV: string | null;
  setSelectedCCTV: (id: string | null) => void;
}

const initialLayerState: LayerState = {
  enabled: false,
  opacity: 1,
  loading: false,
  error: null,
  lastUpdate: null,
  dataCount: 0,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  // Visual mode
  visualMode: VISUAL_MODES.NORMAL,
  setVisualMode: (mode) => set({ visualMode: mode }),

  // Layer states
  layers: {
    [DATA_LAYERS.SATELLITES]: { ...initialLayerState },
    [DATA_LAYERS.AVIATION]: { ...initialLayerState },
    [DATA_LAYERS.TRAFFIC]: { ...initialLayerState },
    [DATA_LAYERS.CCTV]: { ...initialLayerState },
  },

  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: {
          ...state.layers[layer],
          enabled: !state.layers[layer].enabled,
        },
      },
    })),

  setLayerOpacity: (layer, opacity) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: {
          ...state.layers[layer],
          opacity,
        },
      },
    })),

  setLayerLoading: (layer, loading) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: {
          ...state.layers[layer],
          loading,
        },
      },
    })),

  setLayerError: (layer, error) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: {
          ...state.layers[layer],
          error,
        },
      },
    })),

  setLayerData: (layer, count) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: {
          ...state.layers[layer],
          dataCount: count,
          lastUpdate: new Date(),
          loading: false,
          error: null,
        },
      },
    })),

  // Timeline
  currentTime: new Date(),
  isPlaying: false,
  playbackSpeed: 1,

  setCurrentTime: (time) => set({ currentTime: time }),

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // Camera
  cameraPosition: null,
  setCameraPosition: (pos) => set({ cameraPosition: pos }),

  // Selected entity
  selectedEntity: {
    type: null,
    id: null,
    data: null,
  },
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),

  // UI state
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // CCTV feed
  selectedCCTV: null,
  setSelectedCCTV: (id) => set({ selectedCCTV: id }),
}));
