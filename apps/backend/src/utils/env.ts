import { z } from 'zod/v4';
import { parseArgs } from 'util';

// cli args must have precedence over env vars: so if both are provided, the cli args will be merged into the env vars

const { values: args } = parseArgs({
  args: Bun.argv,
  options: {
    port: {
      type: 'string',
      short: 'P',
      default: process.env.PORT || '3001', // Default port, should match backend's env.PORT
    },
    fe_port: {
      type: 'string',
      short: 'P',
      default: process.env.FRONTEND_PORT || '3002', // Default port of frontend, should match backend's env.FRONTEND_PORT
    },
  },
  strict: false,
  allowPositionals: true,
});

if (args.port && isNaN(Number(args.port))) {
  throw new Error(`PORT must be a number, but got: ${args.port}`);
}

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
  PORT: z.coerce
    .number()
    .default(
      args.port && typeof args.port !== 'boolean' ? Number(args.port) : 3001,
    ), // default to 3001 if not provided
  FRONTEND_PORT: z.coerce
    .number()
    .default(
      args.fe_port && typeof args.fe_port !== 'boolean'
        ? Number(args.fe_port)
        : 3002,
    ), // default to 3002 if not provided
});

export type Env = z.infer<typeof envSchema>;

const { data, error } = envSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(z.prettifyError(error));
  process.exit(1);
}

data.PORT =
  typeof args.port !== 'boolean' ? Number(args.port) || data.PORT : data.PORT; // ensure PORT is a number and set it from cli args if provided
data.FRONTEND_PORT =
  typeof args.fe_port !== 'boolean'
    ? Number(args.fe_port) || data.FRONTEND_PORT
    : data.FRONTEND_PORT; // ensure FRONTEND_PORT is a number and set it from cli args if provided
process.env.PORT = data.PORT.toString(); // ensure process.env.PORT is updated as well in case it is used elsewhere
process.env.FRONTEND_PORT = data.FRONTEND_PORT.toString(); // ensure process.env.FRONTEND_PORT is updated as well in case it is used elsewhere

export const env = data;

console.log('✅ Backend envs loaded successfully');

if (env.NODE_ENV === 'development') {
  console.log('----------------------------');
  console.log('Backend envs:');
  console.table(env);
}

export default env;
