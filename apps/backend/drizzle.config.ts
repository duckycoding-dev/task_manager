import { defineConfig } from 'drizzle-kit';
import env from './src/utils/env';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/features/**/*.db.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'jdbc:postgresql://localhost:5432/reusable_task_manager_backend',
    database: env.POSTGRES_DB,
    host: env.POSTGRES_HOST,
    password: env.POSTGRES_PASSWORD,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
  },
  casing: 'snake_case',
});
