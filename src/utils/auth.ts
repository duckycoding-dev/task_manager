import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { openAPI } from 'better-auth/plugins';
import * as authSchemas from 'features/auth/auth.db/';
import type { MiddlewareHandler } from 'hono';
import { AppError } from './errors/http-errors';

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

export const addAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
};

export const checkAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new AppError('UNAUTHORIZED', {
      message: 'Authentication required',
    });
  }
  return next();
};
