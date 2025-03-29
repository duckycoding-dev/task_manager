import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  type ResponseMeta,
  type SuccessResponse,
} from 'types/response/';
import { z } from 'zod';
import { statusCodeMap, type VerboseStatusCode } from './status-codes';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { createRoute } from '@hono/zod-openapi';
import type { AppRouteHandler } from 'types/app_context/';

/**
 * Helper function to send a standardized success JSON response
 * while maintaining type safety and intellisense from OpenAPI schemas
 */
// export function sendSuccessJson<
//   T extends ReturnType<typeof createRoute>,
//   StatusCode extends keyof T['responses'],
//   ResponseType = z.infer<
//     T['responses'][number]['content']['application/json']['schema']
//   >,
// >(
//   c: Context,
//   data: ResponseType,
//   statusCode: StatusCode,
//   message = 'Operation successful',
// ) {
//   return c.json(
//     {
//       success: true,
//       data,
//       message,
//     },
//     statusCode,
//   );
// }

/**
 * Send an HTML response
//  */
// export function sendHtml(
//   c: Context,
//   html: string,
//   status: ContentfulStatusCode = 200,
// ): Response {
//   return c.html(html, status);
// }

// =========================================
// OpenAPI Helper Functions
// =========================================

/**
 * Create a standard JSON response object for successful responses in OpenAPI route config
 */
export function createJsonResponse<T extends z.ZodType>(
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
