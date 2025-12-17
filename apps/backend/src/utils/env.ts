import { z } from 'zod/v4';

export const logLevels = ['debug', 'log', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof logLevels)[number];

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  POSTGRES_USER: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PASSWORD: z.string().default('password'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_HOST: z.string().default('localhost'),
  DB_MIGRATING: z.stringbool().default(false), // only set when running migrations
  DB_SEEDING: z.stringbool().default(false), // only set when running seeds
  BETTER_AUTH_URL: z.string(),
  PORT: z.coerce.number().default(3001), // default to 3001 if not provided
  FRONTEND_PORT: z.coerce.number().default(3002), // default to 3002 if not provided
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

const { data, error } = envSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(z.prettifyError(error));
  process.exit(1);
}

export const env = data;

console.log('✅ Backend envs loaded successfully');

if (env.NODE_ENV === 'development') {
  console.log('----------------------------');
  console.log('Backend envs:');
  console.table(env);
}

export default env;
