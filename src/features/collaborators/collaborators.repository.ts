import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import {
  type Collaborators,
  collaboratorsSchema,
  collaborators,
} from './collaborators.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/http-errors/';

export type CollaboratorsRepository = {
  get: (id: string) => Promise<Collaborators | undefined>;
  // ... other methods
};

export const createCollaboratorsRepository = (
  db: PostgresJsDatabase,
): CollaboratorsRepository => {
  return {
    get: async (id) => {
      const res = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const data = res[0];
      if (!data) {
        return undefined;
      }

      const parsed = collaboratorsSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
      console.log(parsed.error);
      throw new AppError('BAD_REQUEST', {
        message: formatZodError(parsed.error),
        cause: parsed.data,
      });
    },
  };
};
