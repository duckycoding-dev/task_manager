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

/**
 * Utility type that removes both null and optional properties from an object type
 */
export type RemoveNullableAndOptional<T> = {
  [K in keyof T as undefined extends T[K]
    ? never
    : null extends T[K]
      ? never
      : K]: T[K];
};

/**
 * Creates a type based on T where the specified keys K are made required
 * (removing optionality '?') and their types become NonNullable (removing `null | undefined`).
 * Other properties of T remain unchanged.
 *
 * @template T The original object type.
 * @template K The key(s) of T to make required and non-nullable (can be a single key or a union of keys).
 */
export type MarkPropertiesRequired<T, K extends keyof T> = {
  // Part 1: Pick the specified key(s) K.
  // The '-?' mapping modifier removes optionality (makes them required).
  // NonNullable<T[P]> removes 'null' and 'undefined' from the property's type.
  [P in K]-?: NonNullable<T[P]>;
} & Omit<T, K>; // Part 2: Include the rest of the properties from T exactly as they were.
