import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  type ErrorResponse,
  type ResponseMeta,
  type SuccessResponse,
} from 'types/response/';
import { z } from 'zod';
import { errorMap, type StatusCode } from './errors';
import type { Context } from 'hono';
import type { AppContext } from 'types/app_context/';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Send a success response with data and optional metadata
 */
export function sendSuccess<T>(
  c: Context<AppContext>,
  data: T,
  {
    meta,
    message,
    status = 200,
  }: {
    meta?: ResponseMeta;
    message?: string;
    status?: ContentfulStatusCode;
  } = {},
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
    ...(message && { message }),
  };

  return c.json(response, status);
}

/**
 * Send an error response
 */
export function sendError(
  c: Context,
  error: string,
  code: StatusCode,
  {
    cause,
    stack,
    status = 400,
  }: {
    cause?: unknown;
    stack?: string;
    status?: ContentfulStatusCode;
  } = {},
): Response {
  const response: ErrorResponse = {
    success: false,
    error,
    code,
    ...(stack && process.env.NODE_ENV !== 'production' && { stack }),
  };
  if (cause) {
    response.cause = cause;
  }

  return c.json(response, status);
}

/**
 * Send an HTML response
 */
export function sendHtml(
  c: Context,
  html: string,
  status: ContentfulStatusCode = 200,
): Response {
  return c.html(html, status);
}

// =========================================
// OpenAPI Helper Functions
// =========================================

/**
 * Create a standard JSON response object for successful responses in OpenAPI route config
 */
export function createSuccessResponseDefinition<T extends z.ZodType>(
  dataSchema: T,
  {
    status = 'OK',
    description = 'Success',
  }: {
    status?: StatusCode;
    description?: string;
  } = {},
) {
  const successResponse = {
    [errorMap[status]?.status ?? errorMap['OK'].status]: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(dataSchema),
        },
      },
      description,
    },
  };

  return successResponse;
}

/**
 * Create a standard JSON response object for errors in OpenAPI route config
 */
export function createErrorResponseDefinition({
  status = 'VALIDATION',
  description = 'Error',
}: {
  status?: StatusCode;
  description?: string;
} = {}) {
  return {
    [errorMap[status]?.status ?? errorMap['VALIDATION'].status]: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description,
    },
  };
}

/**
 * Create a standard HTML response object for OpenAPI route config
 */
export function createHtmlResponse({
  status = 'OK',
  description = 'HTML content',
}: {
  status?: StatusCode;
  description?: string;
} = {}) {
  return {
    [errorMap[status]?.status ?? errorMap['OK'].status]: {
      content: {
        'text/html': {
          schema: z.string(),
        },
      },
      description,
    },
  };
}
