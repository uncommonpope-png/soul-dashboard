import { useEffect } from 'react';
import { useAgentStore } from '@/store/useAgentStore';

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-plasma-green',
    processing: 'bg-plasma-amber animate-pulse',
    offline: 'bg-text-muted',
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] ?? 'bg-text-muted'}`}
    />
  );
}

function AgentStatusCard({ agentId }: { agentId: string }) {
  const { agents, events } = useAgentStore();
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return null;

  const recentEvents = events
    .filter((e) => e.agentId === agentId)
    .slice(-3)
    .reverse();

  return (
    <div className='bg-black/30 rounded p-2 border border-white/5'>
      <div className='flex items-center justify-between mb-1'>
        <div className='flex items-center gap-1.5'>
          <StatusDot status={agent.status} />
          <span className='text-[9px] font-jetbrains text-text-primary font-semibold truncate max-w-[80px]'>
            {agent.name.split(' ')[0]}
          </span>
        </div>
        <span className='text-[7px] font-space text-text-muted'>
          {agent.stars > 0 ? `${(agent.stars / 1000).toFixed(0)}k★` : agent.language}
        </span>
      </div>
      {agent.currentTask && (
        <p className='text-[8px] text-plasma-amber font-jetbrains truncate mb-1'>
          {agent.currentTask}
        </p>
      )}
      {recentEvents.length > 0 && (
        <div className='space-y-0.5'>
          {recentEvents.map((e) => (
            <p key={e.id} className='text-[7px] text-text-muted font-jetbrains truncate'>
              {e.content.slice(0, 40)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Observer() {
  const { agents, events, updateAgentStatus } = useAgentStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const onlineCount = agents.filter((a) => a.status === 'processing').length;
      if (onlineCount === 0) {
        agents.forEach((a) => {
          if (a.status === 'processing') {
            updateAgentStatus(a.id, 'online');
          }
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [agents, updateAgentStatus]);

  const onlineCount = agents.filter((a) => a.status === 'online').length;
  const processingCount = agents.filter((a) => a.status === 'processing').length;
  const latestEvents = events.slice(-10).reverse();

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between flex-shrink-0'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          Observer
        </h2>
        <div className='flex gap-2 text-[9px] font-space'>
          <span className='text-plasma-green'>{onlineCount} online</span>
          <span className='text-plasma-amber'>{processingCount} active</span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-1 flex-shrink-0 max-h-20 overflow-y-auto'>
        {agents.map((a) => (
          <AgentStatusCard key={a.id} agentId={a.id} />
        ))}
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto'>
        <p className='text-[8px] text-text-muted uppercase tracking-widest mb-1 font-jetbrains'>
          Activity Log
        </p>
        <div className='space-y-0.5'>
          {latestEvents.map((e) => {
            const agent = agents.find((a) => a.id === e.agentId);
            return (
              <div key={e.id} className='flex gap-1.5 text-[8px] font-jetbrains'>
                <span className='text-text-muted/50 flex-shrink-0'>
                  {new Date(e.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
                <span className='text-plasma-cyan flex-shrink-0'>
                  [{agent?.name.split(' ')[0] ?? e.agentId}]
                </span>
                <span className='text-text-muted truncate'>{e.content}</span>
              </div>
            );
          })}
          {latestEvents.length === 0 && (
            <p className='text-[9px] text-text-muted font-jetbrains'>No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}