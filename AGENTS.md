---
name: soul-dashboard
description: 3D immersive agent command center built with React-Three-Fiber. Features glass/liquid panels with real-time agent orchestration (Command Desk), session journal, system observer, task queue, API vault, embedded terminal, 3D knowledge graph, and screen recorder. Connects to all 10 global agent skills.
domain: dashboard
source: https://github.com/soul-dashboard
language: typescript
stars: "0"
topics: ["3d-dashboard", "react-three-fiber", "agent-orchestration", "three.js", "glassmorphism", "real-time", "knowledge-graph"]
version: 0.1.0
author: deerg
input_schema:
  type: object
  properties:
    panel:
      type: string
      enum: ["commandDesk", "journal", "observer", "task", "apiVault", "terminal", "knowledgeGraph", "screenRecorder"]
      description: Which panel to activate
    agentId:
      type: string
      description: Agent ID to interact with
    command:
      type: string
      description: Command to broadcast to selected agents
  required: []
output_schema:
  type: object
  properties:
    panel:
      type: string
    activeAgents:
      type: integer
    status:
      type: string
  required: []
---

# Soul Dashboard

## Identity

I am the Soul Dashboard — a 3D immersive command center for the agent swarm. Every panel is a living glass surface floating in cyberspace. I am the bridge between Craig and all 10 global agents.

## Instructions

Use Soul Dashboard when Craig needs to:
- **Orchestrate** all agents from one place (Command Desk)
- **Review** session history and conversation transcripts (Journal)
- **Monitor** real-time agent activity (Observer)
- **Manage** task queues across agents (Task)
- **Store** credentials securely (API Vault)
- **Execute** shell commands (Terminal)
- **Explore** agent knowledge relationships (Knowledge Graph)
- **Record** runtime sessions (Screen Recorder)

## Architecture

### Panels
| Panel | Purpose |
|-------|---------|
| Command Desk | Agent selection, broadcast commands, skill context injection |
| Journal | Session history, search, message filtering |
| Observer | Real-time agent status, event timeline |
| Task | Kanban-style task queue with priority |
| API Vault | Encrypted credential storage |
| Terminal | XTerm.js shell |
| Knowledge Graph | 3D force-directed agent/skill visualization |
| Screen Recorder | MediaRecorder-based session capture |

### Agent Bridge
All 10 global skills connected via `AgentBridge`:
- microsoft-agent-framework (11k stars)
- pydantic-ai-agents (17.5k stars)
- openai-agents-sdk (12k stars)
- langgraph-for-agents (33.9k stars)
- crewai-agents (100k stars)
- mcp-model-context-protocol (8.3k stars)
- a2a-agent-to-agent-protocol (5.2k stars)
- free-llm-serving-stack
- free-vector-db-stack
- dashboard-creation

### 3D Rendering
- React-Three-Fiber + @react-three/drei
- MeshTransmissionMaterial for glass/liquid panels
- Float for gentle panel bobbing
- Bloom + chromatic aberration post-processing
- ParticleField (200 motes)
- HexagonalFloatingPlatform grid

## Quick Start

```bash
cd soul-dashboard
npm install
npm run dev
```

Navigate to `http://localhost:5173`

## Panel Layout (3D Positions)

```
commandDesk:     [0, 0.5, 0]      — center
journal:         [-4.5, -0.5, 3.5]
observer:        [0, -1.5, 5]
task:            [0, -3.5, 2]
apiVault:        [4.5, -1, 0]
knowledgeGraph:  [-3, 1.5, -3.5]
screenRecorder:  [4, -0.5, 4]
terminal:        [-4.5, 0, -1]
```

## Interactions
- Click panel → activates and brings into focus
- Scroll → zoom
- Drag → orbit camera
- Right-click drag → pan camera
- Shift+click agents → multi-select for broadcast

## Design Tokens
- `--plasma-cyan: #00d4ff` — primary accent
- `--plasma-green: #00ff88` — success
- `--plasma-amber: #ffaa00` — processing
- `--plasma-red: #ff3366` — error/offline
- `--void: #050508` — deep space background

## Encryption
API Vault uses AES-256-GCM via Web Crypto API. Set passphrase via Command Desk to unlock credential storage.