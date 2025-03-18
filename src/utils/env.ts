import { z } from 'zod';

const stringBoolean = z.coerce
  .string()
  .transform((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  })
  .default('false');

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  // LOG_LEVEL: z.enum([
  //   'fatal',
  //   'error',
  //   'warn',
  //   'info',
  //   'debug',
  //   'trace',
  //   'silent',
  // ]),
  POSTGRES_USER: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PASSWORD: z.string().default('password'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_HOST: z.string().default('localhost'),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
});

export type Env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
