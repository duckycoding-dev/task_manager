import type {
  OpenAPIHono,
  RouteConfig,
  RouteConfigToEnv,
  RouteHandler,
} from '@hono/zod-openapi';
import type { Env } from 'hono';
import type { auth } from 'utils/auth/';

export interface AppContext extends Env {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Bindings: {};
}

export type AppOpenAPI = OpenAPIHono<AppContext>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  // RouteConfigToEnv<R> lets us use the context of the route considering the middlewares
  RouteConfigToEnv<R> extends AppContext ? RouteConfigToEnv<R> : AppContext
>;

export type AppRoutes = Record<string, RouteConfig>;
