import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { type Projects, projectsSchema, projects } from './projects.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';

export type ProjectsRepository = {
  get: (id: string) => Promise<Projects | undefined>;
  // ... other methods
};

export const createProjectsRepository = (
  db: PostgresJsDatabase,
): ProjectsRepository => {
  return {
    get: async (id) => {
      const res = await db.select().from(projects).where(eq(projects.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const data = res[0];
      if (!data) {
        return undefined;
      }

      const parsed = projectsSchema.safeParse(data);
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
