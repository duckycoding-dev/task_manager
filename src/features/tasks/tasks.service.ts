import type { TasksRepository } from './tasks.repository';
import type { Task } from './tasks.db';
import type { GetTasksQuery } from './tasks.types';

export type TasksService = {
  getTasks: (
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
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
  };
};
