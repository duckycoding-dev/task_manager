import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { tasks } from '../tasks/tasks.db';
import { type Tasks, tasksSchema } from './tasks.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';

export type TasksRepository = {
  getTask: (id: string) => Promise<Tasks | undefined>;
  // ... other methods
};

export const createTasksRepository = (
  db: PostgresJsDatabase,
): TasksRepository => {
  return {
    getTask: async (id) => {
      const res = await db.select().from(tasks).where(eq(tasks.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const task = res[0];
      if (!task) {
        return undefined;
      }

      const parsed = tasksSchema.safeParse(task);
      if (parsed.success) {
        return parsed.data;
      }
      console.log(parsed.error);
      throw new AppError('VALIDATION', {
        message: formatZodError(parsed.error),
        cause: parsed.data,
      });
    },
  };
};
