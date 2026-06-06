import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'queued' | 'running' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  result?: string;
}

interface TaskStore {
  tasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

const priorityOrder: Record<TaskPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      createTask: (taskData) => {
        const id = uuid();
        const task: Task = { ...taskData, id, createdAt: new Date(), status: 'queued' };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return id;
      },
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      moveTask: (id, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: newStatus,
                  completedAt: newStatus === 'done' ? new Date() : t.completedAt,
                }
              : t
          ),
        })),
      getTasksByStatus: (status) =>
        get().tasks
          .filter((t) => t.status === status)
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    }),
    { name: 'soul-dashboard-tasks' }
  )
);