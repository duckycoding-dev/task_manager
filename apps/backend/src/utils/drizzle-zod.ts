import { createSchemaFactory } from 'drizzle-zod';

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    // This configuration will only coerce dates. Set `coerce` to `true` to coerce all data types or specify others
    coerce: {
      date: true,
      boolean: true,
      number: true,
      string: true,
    },
  });
