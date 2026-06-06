import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { AGENT_SKILLS, getSkillContext, type SkillContext } from './agentRegistry';
import { useAgentStore } from '@/store/useAgentStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import type { AgentStatus } from '@/store/useDashboardStore';

export interface AgentResponse {
  agentId: string;
  content: string;
  tokens?: number;
  latency: number;
}

interface AgentBridgeContext {
  agents: SkillContext[];
  broadcast: (message: string, selectedAgentIds?: string[]) => Promise<Map<string, AgentResponse>>;
  sendToAgent: (agentId: string, message: string) => Promise<AgentResponse>;
  getAgentStatus: (agentId: string) => AgentStatus;
  injectSkillContext: (agentId: string) => string;
  simulateResponse: (agentId: string, message: string) => Promise<AgentResponse>;
}

const AgentBridgeContext = createContext<AgentBridgeContext | null>(null);

export function AgentBridgeProvider({ children }: { children: React.ReactNode }) {
  const { updateAgentStatus, addMessage, addEvent } = useAgentStore();
  const { selectedAgents } = useDashboardStore();
  const responseQueue = useRef<Map<string, string>>(new Map());

  const getAgentStatus = useCallback(
    (agentId: string): AgentStatus => {
      return useAgentStore.getState().agents.find((a) => a.id === agentId)?.status ?? 'offline';
    },
    []
  );

  const simulateResponse = useCallback(
    async (agentId: string, message: string): Promise<AgentResponse> => {
      const start = Date.now();
      updateAgentStatus(agentId, 'processing', message.slice(0, 50));

      await new Promise((r) => setTimeout(r, 600 + Math.random() * 1200));

      const skill = getSkillContext(agentId);
      const responseText = `[${agentId.toUpperCase()}] Processed: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"\n\nSkill context loaded: ${skill ? 'YES' : 'NO'}\nStars: ${AGENT_SKILLS.find((a) => a.id === agentId)?.stars ?? 0}`;

      updateAgentStatus(agentId, 'online');
      addEvent({ agentId, type: 'message', content: responseText });

      const latency = Date.now() - start;
      const tokens = Math.floor(message.length * 1.3);

      return { agentId, content: responseText, tokens, latency };
    },
    [updateAgentStatus, addEvent]
  );

  const sendToAgent = useCallback(
    async (agentId: string, message: string): Promise<AgentResponse> => {
      addMessage({ role: 'user', agentId, content: message });
      updateAgentStatus(agentId, 'processing', message.slice(0, 50));

      const response = await simulateResponse(agentId, message);

      addMessage({ role: 'agent', agentId, content: response.content });
      updateAgentStatus(agentId, 'online');

      return response;
    },
    [addMessage, updateAgentStatus, simulateResponse]
  );

  const broadcast = useCallback(
    async (
      message: string,
      agentIds?: string[]
    ): Promise<Map<string, AgentResponse>> => {
      const targets = (agentIds ?? selectedAgents).filter(Boolean);
      const results = new Map<string, AgentResponse>();

      await Promise.all(
        targets.map(async (agentId) => {
          try {
            const response = await sendToAgent(agentId, message);
            results.set(agentId, response);
          } catch (err) {
            results.set(agentId, {
              agentId,
              content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
              latency: 0,
            });
          }
        })
      );

      return results;
    },
    [selectedAgents, sendToAgent]
  );

  const injectSkillContext = useCallback((agentId: string): string => {
    return getSkillContext(agentId);
  }, []);

  return (
    <AgentBridgeContext.Provider
      value={{
        agents: AGENT_SKILLS,
        broadcast,
        sendToAgent,
        getAgentStatus,
        injectSkillContext,
        simulateResponse,
      }}
    >
      {children}
    </AgentBridgeContext.Provider>
  );
}

export function useAgentBridge(): AgentBridgeContext {
  const ctx = useContext(AgentBridgeContext);
  if (!ctx) throw new Error('useAgentBridge must be used within AgentBridgeProvider');
  return ctx;
}