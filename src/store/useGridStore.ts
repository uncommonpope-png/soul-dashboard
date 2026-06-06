import { create } from 'zustand';

export type BuildingType = 'residential' | 'commercial' | 'core' | null;

interface BuildingData {
  type: BuildingType;
  height: number;
  color: string;
}

export interface GridCellState {
  id: string;
  ring: number;
  spoke: number;
  worldX: number;
  worldZ: number;
  building: BuildingData | null;
  label: string | null;
  selected: boolean;
  hovered: boolean;
}

export type GridTheme = 'cyberpunk' | 'neon' | 'mars';

interface GridStoreState {
  cells: Map<string, GridCellState>;
  selectedCellId: string | null;
  theme: GridTheme;
  gridRings: number;
  gridSpokes: number;
  showGridLabels: boolean;
  rainEnabled: boolean;

  initCells: (cells: GridCellState[]) => void;
  selectCell: (id: string | null) => void;
  hoverCell: (id: string | null) => void;
  placeBuilding: (cellId: string, type: BuildingType) => void;
  removeBuilding: (cellId: string) => void;
  setLabel: (cellId: string, label: string) => void;
  setTheme: (theme: GridTheme) => void;
  setRainEnabled: (enabled: boolean) => void;
  getSelectedCell: () => GridCellState | null;
}

export const useGridStore = create<GridStoreState>((set, get) => ({
  cells: new Map(),
  selectedCellId: null,
  theme: 'cyberpunk',
  gridRings: 16,
  gridSpokes: 24,
  showGridLabels: false,
  rainEnabled: true,

  initCells: (cells) => {
    const map = new Map<string, GridCellState>();
    cells.forEach((c) => map.set(c.id, c));
    set({ cells: map });
  },

  selectCell: (id) => {
    const state = get();
    const prev = state.selectedCellId;
    if (prev) {
      const prevCell = state.cells.get(prev);
      if (prevCell) {
        state.cells.set(prev, { ...prevCell, selected: false });
      }
    }
    if (id) {
      const cell = state.cells.get(id);
      if (cell) {
        state.cells.set(id, { ...cell, selected: true });
      }
    }
    set({ cells: new Map(state.cells), selectedCellId: id });
  },

  hoverCell: (id) => {
    const state = get();
    state.cells.forEach((cell, key) => {
      if (cell.hovered !== (key === id)) {
        state.cells.set(key, { ...cell, hovered: key === id });
      }
    });
    set({ cells: new Map(state.cells) });
  },

  placeBuilding: (cellId, type) => {
    const state = get();
    const cell = state.cells.get(cellId);
    if (!cell || !type) return;
    const height = type === 'core' ? 15 + Math.random() * 15
      : type === 'commercial' ? 8 + Math.random() * 8
      : 3 + Math.random() * 5;
    const color = type === 'core' ? '#00d4ff'
      : type === 'commercial' ? '#4488ff'
      : '#00ff88';
    state.cells.set(cellId, {
      ...cell,
      building: { type, height, color },
      label: cell.label || `${type} ${cellId}`,
    });
    set({ cells: new Map(state.cells) });
  },

  removeBuilding: (cellId) => {
    const state = get();
    const cell = state.cells.get(cellId);
    if (!cell) return;
    state.cells.set(cellId, { ...cell, building: null });
    set({ cells: new Map(state.cells) });
  },

  setLabel: (cellId, label) => {
    const state = get();
    const cell = state.cells.get(cellId);
    if (!cell) return;
    state.cells.set(cellId, { ...cell, label });
    set({ cells: new Map(state.cells) });
  },

  setTheme: (theme) => {
    set({ theme });
  },

  setRainEnabled: (enabled) => {
    set({ rainEnabled: enabled });
  },

  getSelectedCell: () => {
    const state = get();
    return state.selectedCellId ? state.cells.get(state.selectedCellId) || null : null;
  },
}));
