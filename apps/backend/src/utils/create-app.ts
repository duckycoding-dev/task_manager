import { OpenAPIHono } from '@hono/zod-openapi';
import { AppError, errorHandler } from './errors/http-errors';
import type {
  AppContext,
  AppOpenAPI,
  AppRouteHandler,
  AppRoutes,
} from '../types/app_context';
import { configureOpenAPI } from './configure-open-api';
import { formatZodError } from './mapping';
import { addAuthMiddleware, auth } from './auth';
import { cors } from 'hono/cors';
import env from './env';

export function createRouter() {
  const router = new OpenAPIHono<AppContext>({
    strict: false, // treat trailing slashes as the same route as no trailing slashes
    defaultHook: (result) => {
      if (!result.success) {
        throw new AppError('BAD_REQUEST', {
          cause: result.target,
          message: formatZodError(result.error),
        });
      }
    },
  });
  return router;
}

/**
 * Popoulate the router with the routes and the controller
 * This works, but it's not type safe as of hono v4.7.0
 * @deprecated
 **/
export function popoulateRouter<C extends object>(
  router: AppOpenAPI,
  routes: AppRoutes,
  controller: C,
) {
  Object.entries(routes).forEach(([name, route]) => {
    // popoulate the user router with the user routes;
    if (name in controller) {
      const handler = controller[name as keyof C] as AppRouteHandler<
        typeof route
      >;
      router.openapi(route, handler);
    } else {
      console.warn(
        `No controller found for route: "${route.path}" - ${route.method.toUpperCase()} - ${name}`,
      );
    }
  });
}

export function createApp(): AppOpenAPI {
  const app = createRouter();
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
