import { AgentBridgeProvider } from '@/agents/AgentBridge';
import { DashboardBackground } from '@/components/three/DashboardBackground';
import CommandDesk from '@/components/panels/CommandDesk';
import Journal from '@/components/panels/Journal';
import Observer from '@/components/panels/Observer';
import Task from '@/components/panels/Task';
import ApiVault from '@/components/panels/ApiVault';
import Terminal from '@/components/panels/Terminal';
import KnowledgeGraph from '@/components/panels/KnowledgeGraph';
import ScreenRecorder from '@/components/panels/ScreenRecorder';
import { GridControlPanel } from '@/components/panels/GridControlPanel';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useState, useEffect, useRef, useMemo } from 'react';

const PANELS: Record<string, { title: string; component: React.ComponentType; defaultPos: [number, number]; defaultSize: [number, number] }> = {
  commandDesk: { title: 'Command Desk', component: CommandDesk, defaultPos: [50, 50], defaultSize: [720, 520] },
  journal: { title: 'Journal', component: Journal, defaultPos: [30, 480], defaultSize: [420, 380] },
  observer: { title: 'Observer', component: Observer, defaultPos: [500, 480], defaultSize: [420, 320] },
  task: { title: 'Task Queue', component: Task, defaultPos: [930, 480], defaultSize: [520, 420] },
  apiVault: { title: 'API Vault', component: ApiVault, defaultPos: [50, 900], defaultSize: [360, 420] },
  terminal: { title: 'Terminal', component: Terminal, defaultPos: [450, 900], defaultSize: [460, 380] },
  knowledgeGraph: { title: 'Knowledge Graph', component: KnowledgeGraph, defaultPos: [950, 900], defaultSize: [620, 520] },
  screenRecorder: { title: 'Recorder', component: ScreenRecorder, defaultPos: [500, 50], defaultSize: [360, 260] },
};

const PANEL_KEYS = Object.keys(PANELS);

interface DraggablePanelProps {
  panelId: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPositionChange?: (pos: [number, number]) => void;
}

function DraggablePanel({ panelId, children, style, onPositionChange }: DraggablePanelProps) {
  const { activePanel, setActivePanel, panelStates } = useDashboardStore();
  const [pos, setPos] = useState<[number, number]>(() => {
    const stored = panelStates[panelId];
    return stored ? [stored.position[0], stored.position[1]] : [50, 50];
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isActive = activePanel === panelId;

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos[0],
      startPosY: pos[1],
    };
    setActivePanel(panelId as any);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.startPosX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + dy));
      const newPos: [number, number] = [newX, newY];
      setPos(newPos);
      onPositionChange?.(newPos);
    };
    const onUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, onPositionChange]);

  return (
    <div
      ref={panelRef}
      className={`glass-panel absolute z-10 transition-shadow duration-300 ${
        isActive ? 'ring-1 ring-plasma-cyan/40 shadow-[0_0_30px_rgba(0,212,255,0.15)]' : 'shadow-lg'
      }`}
      style={{
        left: pos[0],
        top: pos[1],
        ...style,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        minWidth: 300,
        minHeight: 200,
      }}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
}

interface ConnectionLinesProps {
  navButtonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  panelPositions: Record<string, [number, number]>;
}

function ConnectionLines({ navButtonRefs, panelPositions }: ConnectionLinesProps) {
  const lines = useMemo(() => {
    return PANEL_KEYS.map((id) => {
      const btn = navButtonRefs.current[id];
      if (!btn) return null;
      const btnRect = btn.getBoundingClientRect();
      const panelPos = panelPositions[id];
      if (!panelPos) return null;

      const navCenterX = btnRect.left + btnRect.width / 2;
      const navCenterY = btnRect.bottom;

      return (
        <line
          key={id}
          className="connection-line"
          x1={navCenterX}
          y1={navCenterY}
          x2={panelPos[0] + 150}
          y2={panelPos[1] + 50}
          stroke="rgba(0,212,255,0.05)"
          strokeWidth="1"
        />
      );
    });
  }, [navButtonRefs.current, panelPositions]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]">
      {lines}
    </svg>
  );
}

export default function App() {
  const { activePanel, setActivePanel } = useDashboardStore();
  const [showPanelNav, setShowPanelNav] = useState(true);
  const [panelPositions, setPanelPositions] = useState<Record<string, [number, number]>>({});
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handlePanelPositionChange = (panelId: string, pos: [number, number]) => {
    setPanelPositions((prev) => ({ ...prev, [panelId]: pos }));
  };

  useEffect(() => {
    const initialPositions: Record<string, [number, number]> = {};
    PANEL_KEYS.forEach((id) => {
      const panel = PANELS[id];
      initialPositions[id] = panel.defaultPos;
    });
    setPanelPositions(initialPositions);
  }, []);

  const activeCount = PANEL_KEYS.filter((id) => panelPositions[id] !== undefined).length;

  return (
    <AgentBridgeProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-void">
        <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
          <DashboardBackground />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-plasma-cyan/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-plasma-green/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-plasma-amber/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <ConnectionLines navButtonRefs={navButtonRefs} panelPositions={panelPositions} />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 mt-2">
          <div
            className="glass-panel flex items-center gap-1 px-3 py-2 border border-plasma-cyan/20 nav-glow-border"
            style={{
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            }}
          >
            <span className="font-orbitron text-[10px] text-plasma-cyan tracking-widest mr-3">SOUL</span>
            {Object.entries(PANELS).map(([id, panel]) => (
              <button
                key={id}
                ref={(el) => { navButtonRefs.current[id] = el; }}
                onClick={() => setActivePanel(id as any)}
                className={`relative px-2.5 py-1 rounded text-[9px] font-jetbrains transition-all duration-200 ${
                  activePanel === id
                    ? 'bg-plasma-cyan/20 text-plasma-cyan border border-plasma-cyan/40'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent'
                }`}
              >
                {activePanel === id && <div className="laser-indicator" />}
                {panel.title}
              </button>
            ))}
            <div className="ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-plasma-cyan/10 border border-plasma-cyan/20">
              <span className="font-jetbrains text-[8px] text-plasma-cyan tracking-wider">
                {PANEL_KEYS.length}/{PANEL_KEYS.length} PANELS
              </span>
            </div>
          </div>
        </div>

        {Object.entries(PANELS).map(([id, panel]) => {
          const PanelContent = panel.component;
          const isActive = activePanel === id;
          return (
            <DraggablePanel
              key={id}
              panelId={id}
              onPositionChange={(pos) => handlePanelPositionChange(id, pos)}
            >
              <div className={`flex flex-col h-full transition-all duration-300 ${
                isActive ? 'active-panel' : 'inactive-panel'
              }`}>
                <PanelContent />
              </div>
            </DraggablePanel>
          );
        })}

        {activePanel && (
          <div className="absolute bottom-4 left-4 z-50">
            <div
              className="relative overflow-hidden glass-panel px-3 py-2 border border-plasma-cyan/30"
              style={{
                minWidth: '140px',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: '0 0 20px rgba(0,212,255,0.15), 0 0 40px rgba(0,212,255,0.05)',
              }}
            >
              <div className="scan-line" />
              <div className="relative flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="radar-dot" />
                  <span className="font-orbitron text-[9px] text-plasma-cyan tracking-widest">
                    {PANELS[activePanel]?.title.toUpperCase() ?? activePanel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="ml-[7px] text-[7px] text-plasma-cyan/70 tracking-widest font-jetbrains">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <GridControlPanel />

        <div className="absolute bottom-4 right-4 z-50 pointer-events-none" style={{ marginTop: 200 }}>
          <p className="text-[8px] font-jetbrains text-text-muted/40 text-right">
            Drag panels to reposition · Click nav to activate · ESC to deselect
          </p>
        </div>
      </div>
    </AgentBridgeProvider>
  );
}