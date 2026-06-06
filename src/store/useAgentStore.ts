import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export type AgentStatus = 'online' | 'offline' | 'processing';

export interface Agent {
  id: string;
  name: string;
  description: string;
  stars: number;
  language: string;
  status: AgentStatus;
  lastHeartbeat: Date | null;
  currentTask: string | null;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  agentId?: string;
  content: string;
  timestamp: Date;
  tokens?: number;
  latency?: number;
}

interface AgentEvent {
  id: string;
  agentId: string;
  type: 'message' | 'task_start' | 'task_complete' | 'error';
  content: string;
  timestamp: Date;
}

interface AgentStore {
  agents: Agent[];
  messages: AgentMessage[];
  events: AgentEvent[];
  activeSessionId: string | null;
  updateAgentStatus: (agentId: string, status: AgentStatus, task?: string) => void;
  addMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  addEvent: (event: Omit<AgentEvent, 'id' | 'timestamp'>) => void;
  setActiveSession: (sessionId: string) => void;
  clearMessages: () => void;
  getMessagesBySession: (sessionId: string) => AgentMessage[];
}

const initialAgents: Agent[] = [
  {
    id: 'microsoft-agent-framework',
    name: 'Microsoft Agent Framework',
    description: 'Enterprise-grade multi-agent orchestration with A2A+MCP support',
    stars: 11000,
    language: 'Python/.NET',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'pydantic-ai-agents',
    name: 'Pydantic-AI',
    description: 'Type-safe agent framework with Pydantic validation',
    stars: 17500,
    language: 'Python',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'openai-agents-sdk',
    name: 'OpenAI Agents SDK',
    description: 'Production multi-agent SDK with handoffs and guardrails',
    stars: 12000,
    language: 'Python',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'langgraph-for-agents',
    name: 'LangGraph',
    description: 'Stateful graph orchestration with checkpointing',
    stars: 33900,
    language: 'Python',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'crewai-agents',
    name: 'CrewAI',
    description: 'Role-based multi-agent framework with crews and flows',
    stars: 100000,
    language: 'Python',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'mcp-model-context-protocol',
    name: 'MCP',
    description: 'Standardized interface for connecting agents to tools',
    stars: 8300,
    language: 'TypeScript',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'a2a-agent-to-agent-protocol',
    name: 'A2A Protocol',
    description: 'Agent-to-agent communication standard (Microsoft + Google)',
    stars: 5200,
    language: 'TypeScript',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'free-llm-serving-stack',
    name: 'Free LLM Serving',
    description: 'Ollama, vLLM, SGLang, Groq — zero-cost inference',
    stars: 0,
    language: 'Python/Docker',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'free-vector-db-stack',
    name: 'Vector DB Stack',
    description: 'Qdrant, Weaviate, Chroma — free RAG databases',
    stars: 0,
    language: 'Python',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
  {
    id: 'dashboard-creation',
    name: 'Dashboard Creation',
    description: '3D/WebGL dashboards with Three.js, Recharts, real-time',
    stars: 0,
    language: 'TypeScript',
    status: 'offline',
    lastHeartbeat: null,
    currentTask: null,
  },
];

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: initialAgents,
  messages: [],
  events: [],
  activeSessionId: null,
  updateAgentStatus: (agentId, status, task) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId
          ? { ...a, status, currentTask: task ?? a.currentTask, lastHeartbeat: new Date() }
          : a
      ),
    })),
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: uuid(), timestamp: new Date() },
      ],
    })),
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, id: uuid(), timestamp: new Date() },
      ].slice(-200),
    })),
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  clearMessages: () => set({ messages: [] }),
  getMessagesBySession: (sessionId) => {
    return get().messages.filter((m) => m.agentId === sessionId);
  },
}));