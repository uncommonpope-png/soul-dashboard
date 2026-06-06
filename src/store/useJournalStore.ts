import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export interface Session {
  id: string;
  agentIds: string[];
  title: string;
  createdAt: Date;
  messageCount: number;
}

export interface JournalMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'agent';
  agentId?: string;
  content: string;
  timestamp: Date;
}

interface JournalStore {
  sessions: Session[];
  messages: JournalMessage[];
  activeSessionId: string | null;
  searchQuery: string;
  filterAgentIds: string[];
  createSession: (agentIds: string[], title?: string) => string;
  addMessage: (msg: Omit<JournalMessage, 'id' | 'timestamp'>) => void;
  setActiveSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterAgentIds: (ids: string[]) => void;
  getMessagesForSession: (sessionId: string) => JournalMessage[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      messages: [],
      activeSessionId: null,
      searchQuery: '',
      filterAgentIds: [],
      createSession: (agentIds, title) => {
        const id = uuid();
        const session: Session = {
          id,
          agentIds,
          title: title || `Session ${get().sessions.length + 1}`,
          createdAt: new Date(),
          messageCount: 0,
        };
        set((state) => ({ sessions: [session, ...state.sessions] }));
        return id;
      },
      addMessage: (msg) =>
        set((state) => {
          const newMsg = { ...msg, id: uuid(), timestamp: new Date() };
          const updatedSessions = state.sessions.map((s) =>
            s.id === msg.sessionId
              ? { ...s, messageCount: s.messageCount + 1 }
              : s
          );
          return { messages: [...state.messages, newMsg], sessions: updatedSessions };
        }),
      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          messages: state.messages.filter((m) => m.sessionId !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterAgentIds: (ids) => set({ filterAgentIds: ids }),
      getMessagesForSession: (sessionId) =>
        get().messages.filter((m) => m.sessionId === sessionId),
    }),
    { name: 'soul-dashboard-journal' }
  )
);