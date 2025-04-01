import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { type {{namePascal}}, {{nameCamel}}Schema } from './{{nameCamel}}.db';
import { formatZodError } from 'utils/mapping/';
import { AppError } from 'utils/errors/';

export type {{namePascal}}Repository = {
  get: (id: string) => Promise<{{namePascal}} | undefined>;
  // ... other methods
};

export const create{{namePascal}}Repository = (
  db: PostgresJsDatabase,
): {{namePascal}}Repository => {
  return {
    get: async (id) => {
      const res = await db.select().from({{nameCamel}}).where(eq({{nameCamel}}.id, id));
      if (res.length === 0) {
        return undefined;
      }
      const data = res[0];
      if (!data) {
        return undefined;
      }

      const parsed = {{nameCamel}}Schema.safeParse(data);
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
