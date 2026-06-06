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
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor, BookOpen, Activity, ListTodo, KeyRound,
  Terminal as TerminalIcon, GitBranch, Camera, GripVertical
} from 'lucide-react';

const PANEL_ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  commandDesk: Monitor,
  journal: BookOpen,
  observer: Activity,
  task: ListTodo,
  apiVault: KeyRound,
  terminal: TerminalIcon,
  knowledgeGraph: GitBranch,
  screenRecorder: Camera,
};

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

const springSnap = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.5 };
const springBouncy = { type: 'spring' as const, stiffness: 400, damping: 15 };

interface DraggablePanelProps {
  panelId: string;
  index: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPositionChange?: (pos: [number, number]) => void;
}

function DraggablePanel({ panelId, index, children, style, onPositionChange }: DraggablePanelProps) {
  const { activePanel, setActivePanel, panelStates } = useDashboardStore();
  const stored = panelStates[panelId];
  const initialPos = stored ? stored.position : [50, 50];
  const isActive = activePanel === panelId;
  const Icon = PANEL_ICONS[panelId];

  return (
    <motion.div
      className="absolute z-10"
      style={{ minWidth: 300, minHeight: 200, ...style }}
      drag
      dragMomentum
      dragElastic={0.1}
      initial={{ scale: 0.7, opacity: 0, y: 80 }}
      animate={{
        x: initialPos[0],
        y: initialPos[1],
        scale: isActive ? 1.05 : 0.85,
        opacity: isActive ? 1 : 0.15,
        filter: isActive ? 'blur(0px)' : 'blur(3px)',
      }}
      exit={{ scale: 0.7, opacity: 0, y: -80 }}
      transition={{
        ...springSnap,
        delay: index * 0.08,
      }}
      whileTap={{ scale: isActive ? 1.02 : 0.85, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const newX = Math.max(0, Math.min(window.innerWidth - 100, initialPos[0] + info.offset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, initialPos[1] + info.offset.y));
        onPositionChange?.([newX, newY]);
      }}
      onPointerDown={() => setActivePanel(panelId as any)}
    >
      <div
        className={`glass-panel h-full flex flex-col overflow-hidden transition-shadow duration-300 ${
          isActive ? 'panel-glow-active' : ''
        }`}
        style={{
          boxShadow: isActive
            ? '0 0 40px oklch(0.82 0.16 235 / 0.25), 0 0 80px oklch(0.82 0.16 235 / 0.1), 0 8px 32px rgba(0,0,0,0.6)'
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-black/20 shrink-0">
          <Icon size={13} className={isActive ? 'text-plasma-cyan' : 'text-text-muted'} />
          <span className={`font-jetbrains text-[10px] tracking-wider ${isActive ? 'text-plasma-cyan' : 'text-text-muted'}`}>
            {PANELS[panelId].title.toUpperCase()}
          </span>
          {isActive && (
            <motion.div
              className="ml-auto w-1.5 h-1.5 rounded-full bg-plasma-cyan"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
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
  const [panelPositions, setPanelPositions] = useState<Record<string, [number, number]>>({});
  const navButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handlePanelPositionChange = useCallback((panelId: string, pos: [number, number]) => {
    setPanelPositions((prev) => ({ ...prev, [panelId]: pos }));
  }, []);

  useEffect(() => {
    const initialPositions: Record<string, [number, number]> = {};
    PANEL_KEYS.forEach((id) => {
      initialPositions[id] = [...PANELS[id].defaultPos];
    });
    setPanelPositions(initialPositions);
  }, []);

  return (
    <AgentBridgeProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-[var(--void)]">
        <div className="absolute inset-0 z-0">
          <DashboardBackground />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'oklch(0.82 0.16 235 / 0.05)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'oklch(0.85 0.22 155 / 0.05)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'oklch(0.80 0.18 85 / 0.03)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <ConnectionLines navButtonRefs={navButtonRefs} panelPositions={panelPositions} />

        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50 mt-2"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
        >
          <div
            className="glass-panel flex items-center gap-1 px-3 py-2 border border-plasma-cyan/20 nav-glow-border"
            style={{
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            }}
          >
            <span className="font-orbitron text-[10px] text-plasma-cyan tracking-widest mr-2">SOUL</span>
            {Object.entries(PANELS).map(([id, panel]) => {
              const Icon = PANEL_ICONS[id];
              return (
                <motion.button
                  key={id}
                  ref={(el) => { navButtonRefs.current[id] = el; }}
                  onClick={() => setActivePanel(id as any)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-jetbrains ${
                    activePanel === id
                      ? 'bg-plasma-cyan/20 text-plasma-cyan border border-plasma-cyan/40'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {activePanel === id && (
                    <motion.div
                      className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-plasma-cyan rounded-sm"
                      layoutId="navLaser"
                      style={{ boxShadow: '0 0 4px var(--plasma-cyan), 0 0 8px var(--plasma-cyan)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  <Icon size={10} />
                  {panel.title}
                </motion.button>
              );
            })}
            <motion.div
              className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-plasma-cyan/10 border border-plasma-cyan/20"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-jetbrains text-[8px] text-plasma-cyan tracking-wider">
                {PANEL_KEYS.length}/{PANEL_KEYS.length}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {Object.entries(PANELS).map(([id, panel], i) => {
            const PanelContent = panel.component;
            return (
              <DraggablePanel
                key={id}
                panelId={id}
                index={i}
                onPositionChange={(pos) => handlePanelPositionChange(id, pos)}
              >
                <PanelContent />
              </DraggablePanel>
            );
          })}
        </AnimatePresence>

        {activePanel && (
          <motion.div
            className="absolute bottom-4 left-4 z-50"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="relative overflow-hidden glass-panel px-3 py-2 border border-plasma-cyan/30"
              style={{
                minWidth: '140px',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: '0 0 20px rgba(0,212,255,0.15), 0 0 40px rgba(0,212,255,0.05)',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="scan-line" />
              <div className="relative flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="radar-dot" />
                  <span className="font-orbitron text-[9px] text-plasma-cyan tracking-widest">
                    {PANELS[activePanel]?.title.toUpperCase() ?? activePanel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={7} className="text-plasma-cyan/70" />
                  <span className="text-[7px] text-plasma-cyan/70 tracking-widest font-jetbrains">
                    ACTIVE
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
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