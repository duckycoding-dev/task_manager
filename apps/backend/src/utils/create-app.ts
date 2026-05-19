import { OpenAPIHono } from '@hono/zod-openapi';
import { AppError, errorHandler } from './errors/http-errors';
import type { AppContext, AppOpenAPI } from '../types/app_context';
import { configureOpenAPI } from './configure-open-api';
import { formatZodError } from './mapping';
import { addAuthMiddleware, auth } from './auth';
import { cors } from 'hono/cors';
import env from './env';
import { logRequestsMiddleware } from './logger';

export function createRouter() {
  const router = new OpenAPIHono<AppContext>({
    strict: false, // treat trailing slashes as the same route as no trailing slashes
    defaultHook: (result) => {
      if (!result.success) {
        throw new AppError('BAD_REQUEST', {
          cause: result.target,
          message: formatZodError(result.error),
          showToClient: true,
        });
      }
    },
  });
  return router;
}

export function createApp(): AppOpenAPI {
  const app = createRouter();
  app.use('*', logRequestsMiddleware);
  app.use('*', addAuthMiddleware);
  configureOpenAPI(app);

  // middleware MUST be defined before the routes that use it
  app.use(
    '*',
    cors({
      origin: `http://localhost:${env.FRONTEND_PORT}`, // replace with your origin
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  ); // https://www.better-auth.com/docs/integrations/hono#cors
  app.on(['POST', 'GET'], '/auth/*', (c) => {
    return auth.handler(c.req.raw);
  });
  app.onError(errorHandler);

  return app;
}
