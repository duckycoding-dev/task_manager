import { AppError } from '../../utils/errors';
import type { TasksRepository } from './tasks.repository';
import type { Tasks } from './tasks.db';

export type TasksService = {
  getTask: (id: string) => Promise<Tasks>;
  // ... other methods
};

export const createTasksService = (
  tasksRepository: TasksRepository,
): TasksService => {
  return {
    getTask: async (id) => {
      const task = await tasksRepository.getTask(id);
      if (!task) {
        throw new AppError('NOT_FOUND', {
          message: 'Task not found',
        });
      }
      return task;
    },
  };
};
