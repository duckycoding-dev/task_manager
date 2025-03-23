import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { type Reminders, remindersSchema, reminders } from './reminders.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';

export type RemindersRepository = {
  get: (id: string) => Promise<Reminders | undefined>;
  // ... other methods
};

export const createRemindersRepository = (
  db: PostgresJsDatabase,
): RemindersRepository => {
  return {
    get: async (id) => {
      const res = await db.select().from(reminders).where(eq(reminders.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const data = res[0];
      if (!data) {
        return undefined;
      }

      const parsed = remindersSchema.safeParse(data);
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
