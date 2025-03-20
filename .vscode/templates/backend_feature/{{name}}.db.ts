import { pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// 🚀 {{namePascal}} Table (Core Task Management)
export const {{nameCamel}} = pgTable('{{nameCamel}}', {  
});

export const {{nameCamel}}Schema = createSelectSchema({{nameCamel}});
export const {{nameCamel}}InsertSchema = createInsertSchema({{nameCamel}});
export type {{namePascal}} = Zod.infer<typeof {{nameCamel}}Schema>;
