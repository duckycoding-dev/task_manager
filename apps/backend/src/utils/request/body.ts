import type { z } from 'zod';

/**
 * Create a JSON body object for OpenAPI route body config
 */
export function createJsonBody<T extends z.ZodType>(
  dataSchema: T,
  description: string,
  required = false,
) {
  const successResponse = {
    content: {
      'application/json': {
        schema: dataSchema,
      },
    },
    required,
    description,
  } as const;

  return successResponse;
}

/**
 * Create a required JSON body object for OpenAPI route body config
 */
export function createRequiredJsonBody<T extends z.ZodType>(
  dataSchema: T,
  description: string,
) {
  return createJsonBody(dataSchema, description, true);
}
