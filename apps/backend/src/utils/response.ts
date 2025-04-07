import { ErrorResponseSchema, SuccessResponseSchema } from 'types/response/';
import { z } from 'zod';
import { statusCodeMap, type VerboseStatusCode } from './status-codes';

// =========================================
// OpenAPI Helper Functions
// =========================================

/**
 * Create a standard JSON response object for successful responses in OpenAPI route config
 */
export function createSuccessJsonResponse<T extends z.ZodType>(
  dataSchema: T,
  description: string,
) {
  const successResponse = {
    content: {
      'application/json': {
        schema: SuccessResponseSchema(dataSchema),
      },
    },
    description,
  } as const;

  return successResponse;
}

/**
 * Create a standard JSON response object for errors in OpenAPI route config
 */
export function createErrorResponse(description = 'Error') {
  const errorResponse = {
    content: {
      'application/json': {
        schema: ErrorResponseSchema,
      },
    },
    description,
  };

  return errorResponse;
}

/**
 * Create a standard HTML response object for OpenAPI route config
 */
export function createHtmlResponse({
  status = 'OK',
  description = 'HTML content',
}: {
  status?: VerboseStatusCode;
  description?: string;
} = {}) {
  return {
    [statusCodeMap[status]?.status ?? statusCodeMap['OK'].status]: {
      content: {
        'text/html': {
          schema: z.string(),
        },
      },
      description,
    },
  };
}
