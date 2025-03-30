import type { createRoute } from '@hono/zod-openapi';
import type { StatusCodeToVerboseCode } from 'utils/status-codes/';

/**
 *  Utility Type to extract Response Codes from OpenAPI Route Handlers
 */
export type ResponseCodes<T extends { responses: Record<number, unknown> }> =
  keyof T['responses'];

/**
 * Utility Type to extract the verbose status code from the OpenAPI Route Handler
 */
export type HandlerStatusCode<
  T extends { responses: Record<number, unknown> },
> = StatusCodeToVerboseCode<Extract<ResponseCodes<T>, number>>;

export type ZodOpenAPIRoute = ReturnType<typeof createRoute>;
