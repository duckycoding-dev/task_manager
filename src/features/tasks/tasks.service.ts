import { AppError } from '../../utils/errors';
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
      const task = await tasksRepository.getTasks(filters);
      if (!task) {
        throw new AppError('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return task;
    },
  };
};
