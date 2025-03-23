import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { type Labels, labelsSchema, labels } from './labels.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';

export type LabelsRepository = {
  get: (id: string) => Promise<Labels | undefined>;
  // ... other methods
};

export const createLabelsRepository = (
  db: PostgresJsDatabase,
): LabelsRepository => {
  return {
    get: async (id) => {
      const res = await db.select().from(labels).where(eq(labels.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const data = res[0];
      if (!data) {
        return undefined;
      }

      const parsed = labelsSchema.safeParse(data);
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
