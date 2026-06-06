import { useState, useCallback } from 'react';
import { useAgentBridge } from '@/agents/AgentBridge';
import { useAgentStore } from '@/store/useAgentStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useJournalStore } from '@/store/useJournalStore';

export default function CommandDesk() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [responses, setResponses] = useState<Map<string, string>>(new Map());
  const { broadcast, injectSkillContext } = useAgentBridge();
  const { agents } = useAgentStore();
  const { selectedAgents, toggleAgent } = useDashboardStore();
  const { createSession, addMessage } = useJournalStore();

  const handleBroadcast = useCallback(async () => {
    if (!input.trim() || selectedAgents.length === 0) return;

    setIsStreaming(true);
    const sessionId = createSession(selectedAgents, input.slice(0, 50));
    addMessage({ sessionId, role: 'user', content: input });

    try {
      const results = await broadcast(input);
      const newResponses = new Map<string, string>();
      results.forEach((r, agentId) => {
        newResponses.set(agentId, r.content);
        addMessage({ sessionId, role: 'agent', agentId, content: r.content });
      });
      setResponses(newResponses);
    } finally {
      setIsStreaming(false);
    }
  }, [input, selectedAgents, broadcast, createSession, addMessage]);

  const handleInjectContext = useCallback(
    (agentId: string) => {
      const context = injectSkillContext(agentId);
      setInput((prev) => prev + (prev ? '\n\n' : '') + `[SKILL CONTEXT for ${agentId}]:\n` + context);
    },
    [injectSkillContext]
  );

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          Command Desk
        </h2>
        <span className='text-[10px] text-text-muted font-space'>
          {selectedAgents.length}/{agents.length} selected
        </span>
      </div>

      <div className='grid grid-cols-2 gap-1.5 flex-shrink-0 max-h-24 overflow-y-auto'>
        {agents.map((agent) => {
          const isSelected = selectedAgents.includes(agent.id);
          return (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              title={agent.description}
              className={`text-left px-2 py-1 rounded text-[9px] font-jetbrains transition-all duration-200 border ${
                isSelected
                  ? 'border-plasma-cyan bg-plasma-cyan/10 text-text-primary'
                  : 'border-transparent bg-white/5 text-text-muted hover:border-plasma-cyan/30 hover:text-text-primary'
              }`}
            >
              <div className='truncate font-semibold'>{agent.name.split(' ')[0]}</div>
              <div className='truncate text-[8px] opacity-60'>{agent.language}</div>
            </button>
          );
        })}
      </div>

      {responses.size > 0 && (
        <div className='flex-1 overflow-y-auto space-y-2 bg-black/20 rounded p-2 min-h-0'>
          {Array.from(responses.entries()).map(([agentId, content]) => (
            <div key={agentId} className='text-[9px]'>
              <div className='text-plasma-cyan font-semibold mb-0.5'>
                {agents.find((a) => a.id === agentId)?.name ?? agentId}
              </div>
              <pre className='text-text-muted whitespace-pre-wrap leading-relaxed font-jetbrains'>
                {content}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className='flex gap-1.5 flex-shrink-0'>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleBroadcast()}
          placeholder='Command agents...'
          disabled={isStreaming || selectedAgents.length === 0}
          className='flex-1 bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary placeholder-text-muted/50 font-jetbrains focus:outline-none focus:border-plasma-cyan/50 disabled:opacity-40'
        />
        <button
          onClick={handleBroadcast}
          disabled={isStreaming || !input.trim() || selectedAgents.length === 0}
          className='px-2 py-1.5 bg-plasma-cyan/10 border border-plasma-cyan/30 rounded text-[9px] font-jetbrains text-plasma-cyan hover:bg-plasma-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          {isStreaming ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}