import type { TasksRepository } from './tasks.repository';
import type { Task } from './tasks.db';
import type { GetTasksQuery } from './tasks.types';

export type TasksService = {
  getTasks: (
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTasksById: (id: string) => Promise<Task | undefined>;
  createTask: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>;
  updateTaskPriority: (id: string, priority: string) => Promise<Task>;
  updateTaskRecurring: (id: string, recurring: string) => Promise<Task>;
  updateTaskStatus: (id: string, status: string) => Promise<Task>;
  // ... other methods
};

export const createTasksService = (
  tasksRepository: TasksRepository,
): TasksService => {
  return {
    getTasks: async (filters) => {
      const tasks = await tasksRepository.getTasks(filters);
      return tasks;
    },
    getTasksById: async (id) => {
      const task = await tasksRepository.getTaskById(id);
      return task;
    },
  };
};

function test() {
  type X = {
    a: number;
    b: string;
  };
  const x = {
    a: 1,
    b: 'b',
  };
  const y = x as X;
  return y;
}
