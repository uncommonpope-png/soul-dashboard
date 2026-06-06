import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentStatus = 'online' | 'offline' | 'processing';
export type ActivePanel =
  | 'commandDesk'
  | 'journal'
  | 'observer'
  | 'task'
  | 'apiVault'
  | 'terminal'
  | 'knowledgeGraph'
  | 'screenRecorder'
  | null;

interface PanelState {
  position: [number, number, number];
  size: [number, number];
  visible: boolean;
}

interface DashboardState {
  activePanel: ActivePanel;
  selectedAgents: string[];
  panelPositions: Record<string, [number, number, number]>;
  panelStates: Record<string, PanelState>;
  isRecording: boolean;
  passPhrase: string | null;

  setActivePanel: (panel: ActivePanel) => void;
  toggleAgent: (id: string) => void;
  setSelectedAgents: (ids: string[]) => void;
  setPanelPosition: (panelId: string, pos: [number, number, number]) => void;
  setIsRecording: (recording: boolean) => void;
  setPassPhrase: (phrase: string) => void;
}

const DEFAULT_PANEL_STATES: Record<string, PanelState> = {
  commandDesk: { position: [50, 50, 0], size: [720, 520], visible: true },
  journal: { position: [30, 480, 0], size: [420, 380], visible: true },
  observer: { position: [500, 480, 0], size: [420, 320], visible: true },
  task: { position: [930, 480, 0], size: [520, 420], visible: true },
  apiVault: { position: [50, 900, 0], size: [360, 420], visible: true },
  terminal: { position: [450, 900, 0], size: [460, 380], visible: true },
  knowledgeGraph: { position: [950, 900, 0], size: [620, 520], visible: true },
  screenRecorder: { position: [500, 50, 0], size: [360, 260], visible: true },
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activePanel: 'commandDesk',
      selectedAgents: [],
      panelPositions: {},
      panelStates: DEFAULT_PANEL_STATES,
      isRecording: false,
      passPhrase: null,

      setActivePanel: (panel) => set({ activePanel: panel }),

      toggleAgent: (id) =>
        set((state) => ({
          selectedAgents: state.selectedAgents.includes(id)
            ? state.selectedAgents.filter((a) => a !== id)
            : [...state.selectedAgents, id],
        })),

      setSelectedAgents: (ids) => set({ selectedAgents: ids }),

      setPanelPosition: (panelId, pos) =>
        set((state) => ({
          panelPositions: { ...state.panelPositions, [panelId]: pos },
        })),

      setIsRecording: (recording) => set({ isRecording: recording }),

      setPassPhrase: (phrase) => set({ passPhrase: phrase }),
    }),
    { name: 'soul-dashboard-v2' }
  )
);