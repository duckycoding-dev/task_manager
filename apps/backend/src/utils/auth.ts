import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { openAPI } from 'better-auth/plugins';
import * as authSchemas from 'features/auth/auth.db/';
import type { MiddlewareHandler } from 'hono';
import { AppError } from './errors/http-errors';
import { createMiddleware } from 'hono/factory';
import type { AppContext } from 'types/app_context/';
import type { MarkPropertiesRequired } from 'types/utility/';
import env from './env';

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
  trustedOrigins: [
    'https://duckycoding.dev',
    ...(env.NODE_ENV === 'development'
      ? [`http://localhost:${env.FRONTEND_PORT}`]
      : []),
  ].filter(Boolean),
});

// This middleware adds the user and session to the context if the user is authenticated: this should run for every request: it does not throw an error if the user is not authenticated, it simply adds it to the context so that it can be accessed in the handlers.
export const addAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return await next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return await next();
};

// This middleware checks if the user is authenticated: if so, it adds the user and session to the context, else it throws. This should be used for routes that require authentication.
export const checkAuthMiddleware = createMiddleware<{
  Variables: MarkPropertiesRequired<
    AppContext['Variables'],
    'user' | 'session'
  >;
  Bindings: AppContext['Bindings'];
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new AppError('UNAUTHORIZED', {
      message: 'Authentication required',
    });
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});
