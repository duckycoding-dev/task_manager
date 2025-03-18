import { migrate } from 'drizzle-orm/postgres-js/migrator';
import env from 'utils/env/';
import { db } from '.';

if (!env.DB_MIGRATING) {
  throw new Error('You must set DB_MIGRATING to "true" to run migrations');
}
await migrate(db, { migrationsFolder: './src/db/migrations' });

await db.$client.end();
