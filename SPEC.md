# Soul Dashboard — Specification

## 1. Concept & Vision

**Soul Dashboard** is a 3D immersive command center — a floating glass citadel in cyberspace where every panel is a living, liquid surface. It feels like piloting a spacecraft's bridge: organic, responsive, and alive. Panels pulse with data, react to agent activity, and morph as you interact. The dashboard is the operational hub of the agent swarm — the place where Craig commands all 10 global agents, monitors their work, and queries their memories.

**Personality:** Cyberpunk meets deep-space science vessel. Not flashy — purposeful. Every glow means something. Every animation communicates state. Silence is empty, motion is attention.

---

## 2. Design Language

### Color Palette

```
--void:           #050508   /* deep space background */
--panel-base:     rgba(15, 20, 35, 0.6)  /* dark glass */
--panel-border:   rgba(0, 212, 255, 0.15) /* cyan edge glow */
--plasma-cyan:    #00d4ff   /* primary accent — agent activity */
--plasma-green:   #00ff88   /* success / task complete */
--plasma-amber:   #ffaa00   /* warning / processing */
--plasma-red:     #ff3366   /* error / agent offline */
--text-primary:   #e8f4ff   /* cool white */
--text-muted:     #5a7a9a   /* dimmed labels */
--particle-dust:  rgba(0, 212, 255, 0.3)  /* ambient particles */
```

### Typography

- **Headings:** `Orbitron` (Google Fonts) — sci-fi geometric
- **Body/UI:** `JetBrains Mono` — monospace, readable, dev-native
- **Data/Metrics:** `Space Mono` — numbers, logs, code
- Fallback: `'Courier New', monospace`

### 3D Aesthetic

- **Panels:** Rounded rectangular meshes with `MeshTransmissionMaterial` (glass/liquid)
- **Platform:** Hexagonal dark metallic base with grid lines
- **Particles:** Floating dust motes (200 points, slow drift)
- **Lighting:** Single ambient + 2 colored point lights (cyan + amber)
- **Post-processing:** Bloom on emissive elements, subtle chromatic aberration on edges
- **Physics:** `Float` from drei — panels bob gently in space

### 2D Panel UI

- Background: `rgba(10, 15, 30, 0.85)` with `backdrop-filter: blur(16px)`
- Border: `1px solid rgba(0, 212, 255, 0.2)`
- Border-radius: `12px`
- Font: JetBrains Mono
- Scrollbars: thin, cyan-tinted
- Inputs: dark with cyan focus ring

---

## 3. Layout & Structure

### 3D Scene Layout

```
            [KNOWLEDGE GRAPH]  ← back-left, 3D node sphere cluster
                   |
[TERMINAL]    [COMMAND DESK]  ← center, elevated
   |               |
[JOURNAL]  [SCREEN RECORDER]   ← front-left
              |
         [OBSERVER]           ← front-center
              |
         [TASK]              ← bottom-center
              |
         [API VAULT]         ← far-right
```

- **Camera:** Starts at `(0, 8, 16)`, looking at origin
- **Controls:** OrbitControls — scroll to zoom, drag to orbit, right-click to pan
- **Panels float** at various Y levels (-2 to +4) for vertical depth
- **Platform** at Y=0 — hexagonal grid visible below panels

### Panel Sizes

| Panel | Width | Height |
|-------|-------|--------|
| Command Desk | 700px | 500px |
| Journal | 400px | 350px |
| Observer | 400px | 300px |
| Task | 500px | 400px |
| Terminal | 450px | 350px |
| API Vault | 350px | 400px |
| Knowledge Graph | 600px | 500px |
| Screen Recorder | 350px | 250px |

---

## 4. Features & Interactions

### 4.1 Command Desk (Primary Panel)

**Purpose:** Orchestrate all 10 agents from one place.

**UI:**
- Agent grid (2x5) — click to select
- Active agent shows: name, description, status (online/offline), star count
- Chat input at bottom — type command, select agent(s), send
- Response stream appears above input (SSE-style)
- "Skill Context" button — injects selected skill SKILL.md into context

**Agents Connected:**
- microsoft-agent-framework
- pydantic-ai-agents
- openai-agents-sdk
- langgraph-for-agents
- crewai-agents
- mcp-model-context-protocol
- a2a-agent-to-agent-protocol
- free-llm-serving-stack
- free-vector-db-stack
- dashboard-creation

**Interactions:**
- Click agent card → highlighted with cyan glow → selected for commands
- Shift+click → multi-select (broadcast mode)
- Double-click → open agent detail modal
- Drag panel → repositions in 3D space

### 4.2 Journal

**Purpose:** Session history, conversation log, audit trail.

**UI:**
- Left sidebar: session list (date + summary)
- Main area: chat transcript with timestamps
- Each message tagged with agent name + color
- Search bar at top
- Filter by agent (multi-select)

**Data:** Persisted to `localStorage` with JSON serialization.

**Interactions:**
- Click session → loads transcript
- Hover message → shows metadata tooltip (tokens, latency)
- Right-click message → copy, re-run, delete

### 4.3 Observer

**Purpose:** Real-time system monitoring — what is each agent doing right now.

**UI:**
- Agent status cards (grid)
- Per-agent: status dot, current task, CPU/memory estimate, last heartbeat
- Activity timeline (scrolling log of events)
- System metrics bar (top): total agents online, active tasks, queue depth

**Updates:** Polls agent state every 2 seconds (via local Zustand store).

**Visual:** Status dots pulse when agent is processing.

### 4.4 Task

**Purpose:** Task queue — submit, track, complete tasks across agents.

**UI:**
- Kanban-style: Queued | Running | Done
- Drag cards between columns
- Each task: title, assigned agent, priority (P0-P3), ETA
- New task button → modal with agent selector + prompt

**Interactions:**
- Drag task → moves between columns
- Click task → detail panel (logs, result, artifacts)
- Priority badges color-coded (P0=red, P1=amber, P2=cyan, P3=muted)

### 4.5 Terminal

**Purpose:** Embedded shell — run CLI commands from within the dashboard.

**UI:** XTerm.js with JetBrains Mono font, cyan-on-dark theme.

**Features:**
- Persistent shell session
- Command history (up/down arrows)
- Copy/paste support
- Fullscreen toggle
- Runs on host machine (Node.js child_process)

### 4.6 API Vault

**Purpose:** Secure storage for API keys, endpoints, credentials — used by agents.

**UI:**
- Card list of stored credentials
- Each card: service name, icon, last-used date, masked key preview
- Add credential button → modal (name, key, base URL, tags)
- Copy-to-clipboard button (key only)

**Security:** Credentials encrypted with a dashboard passphrase (AES-256 via Web Crypto API). Stored in localStorage as encrypted blobs.

### 4.7 Knowledge Graph

**Purpose:** 3D visualization of agent memory, skill relationships, conversation entities.

**UI:**
- 3D force-directed graph (Three.js + custom physics)
- Nodes: agents (large, colored by type), skills (medium), concepts (small)
- Edges: "uses", "knows", "related-to" relationships
- Click node → detail panel with description
- Zoom/pan/orbit in 3D space

**Data:** Generated from agent skill metadata + user interaction history.

**Physics:** Custom force simulation — nodes repel, edges attract, gentle damping.

### 4.8 Screen Recorder

**Purpose:** Record the dashboard runtime as GIF/MP4 — share agent sessions.

**UI:**
- Record/Stop/Preview buttons
- Quality selector (720p/1080p)
- FPS selector (15/30)
- Duration display
- Download button (saves as WebM)

**Implementation:** `MediaRecorder` API capturing the canvas/dom as a stream.

---

## 5. Component Inventory

### 3D Components

| Component | Description |
|-----------|-------------|
| `<DashboardShell>` | Main R3F Canvas, lights, platform, controls |
| `<GlassPanel mesh={}>` | Reusable 3D panel with transmission material + 2D content |
| `<FloatingPlatform>` | Hexagonal base with grid lines |
| `<ParticleField>` | 200 ambient dust motes |
| `<PostEffects>` | Bloom + chromatic aberration |
| `<PanelAnchor>` | 3D position + Float animation wrapper |

### 2D Components

| Component | Description |
|-----------|-------------|
| `<AgentCard>` | Agent info tile (name, stars, status, description) |
| `<ChatInput>` | Multi-agent chat input with skill context button |
| `<SessionList>` | Journal session sidebar |
| `<TranscriptView>` | Chat message list with agent attribution |
| `<StatusDot>` | Pulsing status indicator (online/offline/processing) |
| `<TaskCard>` | Draggable task card (Kanban) |
| `<CredentialCard>` | API key card with masked preview |
| `<GraphNode>` | Knowledge graph node (Three.js mesh + label) |
| `<TerminalWindow>` | XTerm.js wrapper |
| `<RecorderControls>` | Screen recording controls |

---

## 6. Technical Approach

### Stack

```
Framework:      Vite + React 18 + TypeScript
3D Engine:      @react-three/fiber + @react-three/drei
Physics:        @react-three/postprocessing
State:          Zustand (global) + React state (local)
Styling:        Tailwind CSS + CSS variables (no external UI lib)
Terminal:       xterm + xterm-addon-fit
Graph 3D:       Custom Three.js (no heavy lib)
Recording:      MediaRecorder API
Encryption:     Web Crypto API (AES-GCM)
Storage:        localStorage (encrypted) + IndexedDB (journal)
Build:          Vite production build
```

### Project Structure

```
soul-dashboard/
├── SPEC.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.tsx                    ← entry
│   ├── App.tsx                     ← root + Zustand store
│   ├── agents/
│   │   ├── agentRegistry.ts        ← all 10 agents config
│   │   ├── AgentBridge.tsx         ← agent communication layer
│   │   └── skills/
│   │       ├── microsoft-agent-framework.ts
│   │       ├── pydantic-ai-agents.ts
│   │       ├── openai-agents-sdk.ts
│   │       ├── langgraph-for-agents.ts
│   │       ├── crewai-agents.ts
│   │       ├── mcp-model-context-protocol.ts
│   │       ├── a2a-agent-to-agent-protocol.ts
│   │       ├── free-llm-serving-stack.ts
│   │       ├── free-vector-db-stack.ts
│   │       └── dashboard-creation.ts
│   ├── components/
│   │   ├── three/                   ← 3D components
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── FloatingPlatform.tsx
│   │   │   ├── ParticleField.tsx
│   │   │   └── PostEffects.tsx
│   │   └── panels/                 ← 2D panel UIs
│   │       ├── CommandDesk.tsx
│   │       ├── Journal.tsx
│   │       ├── Observer.tsx
│   │       ├── Task.tsx
│   │       ├── ApiVault.tsx
│   │       ├── Terminal.tsx
│   │       ├── KnowledgeGraph.tsx
│   │       └── ScreenRecorder.tsx
│   ├── store/
│   │   ├── useDashboardStore.ts    ← global state
│   │   ├── useAgentStore.ts        ← agent state
│   │   ├── useJournalStore.ts      ← journal/sessions
│   │   └── useTaskStore.ts         ← task queue
│   ├── lib/
│   │   ├── crypto.ts               ← AES-GCM encryption
│   │   ├── storage.ts              ← localStorage + IndexedDB
│   │   ├── screenRecord.ts         ← MediaRecorder wrapper
│   │   └── terminal.ts             ← xterm + child_process
│   └── styles/
│       └── globals.css             ← CSS variables + base styles
└── public/
    └── favicon.ico
```

### Agent Bridge Architecture

Each skill is a self-contained module that exposes:
- `agentConfig` — name, description, stars, repo URL
- `systemPrompt` — the skill's system instructions (from SKILL.md)
- `tools` — available tools for this agent
- `connect()` — initiates agent session
- `send(message)` — sends a message
- `onMessage(callback)` — receives responses

The `AgentBridge` component aggregates all 10 agents and provides:
- Single `broadcast(message)` — send to all selected agents
- Per-agent `send(agentId, message)`
- `getAgentStatus()` — online/offline/processing
- `streamResponse()` — SSE-style streaming of agent responses

### Data Model

```typescript
interface AgentSession {
  id: string;
  agentId: string;
  messages: Message[];
  startedAt: Date;
  endedAt?: Date;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  agentId?: string;
  content: string;
  timestamp: Date;
  tokens?: number;
  latency?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'queued' | 'running' | 'done';
  createdAt: Date;
  completedAt?: Date;
  result?: string;
}

interface Credential {
  id: string;
  service: string;
  key: string; // encrypted
  baseUrl?: string;
  tags: string[];
  createdAt: Date;
  lastUsed?: Date;
}

interface GraphNode {
  id: string;
  type: 'agent' | 'skill' | 'concept';
  label: string;
  description?: string;
  connections: string[]; // node IDs
  position?: [number, number, number];
}

interface DashboardState {
  selectedAgents: string[];
  activePanel: string;
  cameraPosition: [number, number, number];
  panelPositions: Map<string, [number, number, number]>;
}
```

---

## 7. Performance

- Panel content lazy-loaded (only active panel renders fully)
- 3D scene at 60fps target, degrades gracefully
- Knowledge graph uses instanced meshes for 500+ nodes
- Screen recorder only activates when recording
- Terminal only starts shell process when panel is open
- Credentials decrypted on-demand, never stored in plain text in memory

---

## 8. Future Phases

**Phase 2:** Multi-user / network mode (agents on remote servers)
**Phase 3:** Voice commands (Web Speech API)
**Phase 4:** AI-generated panel layouts based on task type
**Phase 5:** Haptic feedback (gamepad vibration on events)