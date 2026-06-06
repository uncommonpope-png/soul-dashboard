import { useState } from 'react';
import { useTaskStore, type Task, type TaskPriority, type TaskStatus } from '@/store/useTaskStore';
import { useAgentStore } from '@/store/useAgentStore';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P0: 'border-plasma-red text-plasma-red',
  P1: 'border-plasma-amber text-plasma-amber',
  P2: 'border-plasma-cyan text-plasma-cyan',
  P3: 'border-text-muted text-text-muted',
};

function TaskCard({ task }: { task: Task }) {
  const { moveTask, deleteTask } = useTaskStore();

  return (
    <div
      className={`bg-black/30 rounded p-2 border ${PRIORITY_COLORS[task.priority]} border-l-2 bg-white/[0.02]`}
    >
      <div className='flex items-start justify-between gap-1 mb-1'>
        <p className='text-[9px] font-jetbrains text-text-primary leading-tight flex-1'>
          {task.title}
        </p>
        <button
          onClick={() => deleteTask(task.id)}
          className='text-[7px] text-text-muted hover:text-plasma-red transition-colors'
        >
          ×
        </button>
      </div>
      <div className='flex items-center justify-between'>
        <span className='text-[7px] font-space text-text-muted'>{task.agentId}</span>
        <div className='flex gap-1'>
          {task.status !== 'queued' && (
            <button
              onClick={() => moveTask(task.id, 'queued')}
              className='text-[7px] text-text-muted hover:text-plasma-cyan'
            >
              ←
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => moveTask(task.id, task.status === 'queued' ? 'running' : 'done')}
              className='text-[7px] text-text-muted hover:text-plasma-green'
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
}) {
  const { agents } = useAgentStore();
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState(agents[0]?.id ?? '');
  const [priority, setPriority] = useState<TaskPriority>('P2');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='glass-panel p-4 w-72 flex flex-col gap-3'>
        <h3 className='font-orbitron text-xs text-plasma-cyan font-bold'>New Task</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Task title'
          className='bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
          autoFocus
        />
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className='bg-black/40 border border-plasma-cyan/20 rounded px-2 py-1.5 text-[10px] text-text-primary font-jetbrains focus:outline-none focus:border-plasma-cyan/50'
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <div className='flex gap-1'>
          {(['P0', 'P1', 'P2', 'P3'] as TaskPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-1 text-[9px] font-jetbrains rounded border transition-colors ${
                priority === p
                  ? PRIORITY_COLORS[p].replace('border-', 'bg-').replace(' text-', '/20 bg-') +
                    ' border-current'
                  : 'border-text-muted/30 text-text-muted hover:border-text-muted/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className='flex gap-2'>
          <button
            onClick={onClose}
            className='flex-1 py-1.5 text-[9px] font-jetbrains text-text-muted border border-text-muted/30 rounded hover:bg-white/5'
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim()) return;
              onSubmit({ title, description: '', agentId, priority });
              onClose();
            }}
            className='flex-1 py-1.5 text-[9px] font-jetbrains text-plasma-cyan border border-plasma-cyan/30 rounded hover:bg-plasma-cyan/10'
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'queued', label: 'Queued' },
  { id: 'running', label: 'Running' },
  { id: 'done', label: 'Done' },
];

export default function Task() {
  const { getTasksByStatus, createTask } = useTaskStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className='flex flex-col h-full p-3 gap-2'>
      <div className='flex items-center justify-between flex-shrink-0'>
        <h2 className='font-orbitron text-xs font-bold text-plasma-cyan tracking-widest uppercase'>
          Task Queue
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className='px-2 py-0.5 text-[9px] font-jetbrains text-plasma-cyan border border-plasma-cyan/30 rounded hover:bg-plasma-cyan/10 transition-colors'
        >
          + New
        </button>
      </div>

      <div className='flex gap-2 flex-1 min-h-0 overflow-hidden'>
        {COLUMNS.map((col) => {
          const tasks = getTasksByStatus(col.id);
          return (
            <div key={col.id} className='flex-1 flex flex-col gap-1 min-w-0 overflow-hidden'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-[8px] font-orbitron text-text-muted tracking-widest uppercase'>
                  {col.label}
                </span>
                <span className='text-[8px] font-space text-text-muted/60'>{tasks.length}</span>
              </div>
              <div className='flex-1 overflow-y-auto space-y-1'>
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
                {tasks.length === 0 && (
                  <p className='text-[8px] text-text-muted/40 text-center mt-2 font-jetbrains'>
                    —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onSubmit={(taskData) => createTask(taskData)}
        />
      )}
    </div>
  );
}