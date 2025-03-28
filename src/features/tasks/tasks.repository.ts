import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { type Task, selectTaskSchema, tasks as tasksModel } from './tasks.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';
import type { GetTasksQuery } from './tasks.types';

export type TasksRepository = {
  getTasks: (
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  // ... other methods
};

export const createTasksRepository = (
  db: PostgresJsDatabase,
): TasksRepository => {
  return {
    getTasks: async (filters) => {
      const { dueDate, priority, projectId, status } = filters;
      const query = db.select().from(tasksModel);

      if (projectId) {
        query.where(eq(tasksModel.projectId, projectId));
      }
      if (dueDate) {
        query.where(eq(tasksModel.dueDate, dueDate));
      }
      if (priority) {
        query.where(eq(tasksModel.priority, priority));
      }
      if (status) {
        query.where(eq(tasksModel.status, status));
      }

      const tasks = await query;

      const parsed = selectTaskSchema.array().safeParse(tasks);
      if (parsed.success) {
        const result: Task[] = parsed.data.map<Task>((d) => d) as Task[];
        return result;
      }
      throw new AppError('VALIDATION', {
        message: formatZodError(parsed.error),
        cause: parsed.data,
      });
    },
  };
};
