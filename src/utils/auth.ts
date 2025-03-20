import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { openAPI } from 'better-auth/plugins';
import * as authSchemas from 'features/auth/auth.db/';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: authSchemas,
  }),
  basePath: '/auth',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 30,
  },
  plugins: [openAPI()],
  trustedOrigins: ['https://duckycoding.dev'],
});
