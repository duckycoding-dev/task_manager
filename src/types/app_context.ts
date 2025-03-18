import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { Env } from 'hono';

export interface AppContext extends Env {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Variables: {};
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Bindings: {};
}

export type AppOpenAPI = OpenAPIHono<AppContext>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppContext
>;

export type AppRoutes = Record<string, RouteConfig>;
