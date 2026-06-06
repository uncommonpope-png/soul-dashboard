import { useState, useMemo } from 'react';
import { useJournalStore, type Session, type JournalMessage } from '@/store/useJournalStore';
import { useAgentStore } from '@/store/useAgentStore';

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function SessionItem({ session }: { session: Session }) {
  const { setActiveSession, deleteSession, activeSessionId } = useJournalStore();
  const isActive = activeSessionId === session.id;

  return (
    <button
      onClick={() => setActiveSession(session.id)}
      className={`w-full text-left px-2 py-1.5 rounded text-[9px] font-jetbrains transition-colors border ${
        isActive
          ? 'border-plasma-cyan/40 bg-plasma-cyan/10'
          : 'border-transparent bg-white/5 hover:border-plasma-cyan/20'
      }`}
    >
      <div className='flex justify-between items-start'>
        <span className='text-text-primary truncate flex-1'>{session.title}</span>
        <span className='text-text-muted ml-1 text-[8px]'>{formatTime(session.createdAt)}</span>
      </div>
      <div className='text-text-muted text-[8px] mt-0.5'>
        {session.messageCount} messages · {session.agentIds.length} agents
      </div>
    </button>
  );
}

function MessageItem({ message }: { message: JournalMessage }) {
  const { agents } = useAgentStore();
  const agent = message.agentId ? agents.find((a) => a.id === message.agentId) : null;

  return (
    <div className={`flex gap-1.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-1 rounded-full flex-shrink-0 ${
          message.role === 'user' ? 'bg-plasma-green' : 'bg-plasma-cyan'
        }`}
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1 mb-0.5'>
          <span className='text-[8px] font-jetbrains text-text-muted'>
            {agent?.name ?? (message.role === 'user' ? 'You' : 'Agent')}
          </span>
          <span className='text-[7px] text-text-muted/50'>{formatTime(message.timestamp)}</span>
        </div>
        <p className='text-[9px] text-text-primary font-jetbrains leading-relaxed whitespace-pre-wrap break-words'>
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function Journal() {
  const {
    sessions,
    messages,
    activeSessionId,
    searchQuery,
    setActiveSession,
    setSearchQuery,
    deleteSession,
  } = useJournalStore();

  const filteredMessages = useMemo(() => {
    if (!activeSessionId) return [];
    return messages
      .filter((m) => m.sessionId === activeSessionId)
      .filter(
        (m) =>
          !searchQuery ||
          m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [messages, activeSessionId, searchQuery]);

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between flex-shrink-0'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          Journal
        </h2>
        <span className='text-[10px] text-text-muted font-space'>{sessions.length} sessions</span>
      </div>

      <div className='flex gap-1.5 flex-shrink-0'>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search...'
          className='flex-1 bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1 text-[9px] text-text-primary placeholder-text-muted/50 font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
        />
        {activeSessionId && (
          <button
            onClick={() => {
              deleteSession(activeSessionId);
              setActiveSession(null);
            }}
            className='px-2 py-1 text-[9px] text-plasma-red border border-plasma-red/30 rounded hover:bg-plasma-red/10 font-jetbrains transition-colors'
          >
            Del
          </button>
        )}
      </div>

      <div className='flex gap-2 flex-1 min-h-0'>
        <div className='w-1/3 flex flex-col gap-1 overflow-y-auto'>
          {sessions.map((s) => (
            <SessionItem key={s.id} session={s} />
          ))}
          {sessions.length === 0 && (
            <p className='text-[9px] text-text-muted text-center mt-4 font-jetbrains'>
              No sessions yet
            </p>
          )}
        </div>

        <div className='flex-1 overflow-y-auto space-y-2 pr-1'>
          {!activeSessionId ? (
            <p className='text-[9px] text-text-muted text-center mt-4 font-jetbrains'>
              Select a session
            </p>
          ) : filteredMessages.length === 0 ? (
            <p className='text-[9px] text-text-muted text-center mt-4 font-jetbrains'>
              No messages
            </p>
          ) : (
            filteredMessages.map((m) => <MessageItem key={m.id} message={m} />)
          )}
        </div>
      </div>
    </div>
  );
}