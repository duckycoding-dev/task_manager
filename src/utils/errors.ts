import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ErrorResponse } from 'src/types/response';
import env from './env';
import {
  DEFAULT_ERROR_MAPPING,
  statusCodeMap,
  type HandlerStatusCode,
  type VerboseStatusCode,
} from './status-codes';
import type { createRoute } from '@hono/zod-openapi';

const DEFAULT_ERROR_RESPONSE: ErrorResponse = {
  success: false,
  error: DEFAULT_ERROR_MAPPING.message,
  verboseCode: 'INTERNAL',
};

type AppErrorOptions = {
  message?: string;
  hideToClient?: boolean;
  statusCodeOverride?: ContentfulStatusCode;
  cause?: unknown;
};

/**
 * Custom error class to handle application-specific errors.
 * The resulting status code and message are determined by the verbose error code if none are provided.
 * @class
 * @extends Error
 *
 * @param code - The verbose status code of the error to throw.
 * @param options - Additional options for the error.
 * @param options.statusCodeOverride - Override the default status code that is defined by the mapper based on the passed error type.
 * @param options.message - Custom error message to display - if omitted the generic mapped message will be shown instead.
 * @param options.hideToClient - Whether to hide the custom error message from the client and show the generic mapped message instead.
 * @example
 * ```ts
 * throw new AppError('NOT_FOUND');
 * throw new AppError('VALIDATION', { message: 'Invalid email' });
 * throw new AppError('INTERNAL', { hideToClient: true });
 * ```
 * @example
 * And advanced use case would be enforcing the available status codes that can be provided based on the API handler response codes defined in the OpenAPI schema.
 * We will use the `HandlerStatusCode` utility type to infer the available status codes in the correct type from the OpenAPI schema.
 * ```ts
 * throw new AppError<HandlerStatusCode<typeof tasksRoutes.getTaskById>>('ANY OF THE ERROR CODES DEFINED IN THE OPENAPI SCHEMA', {);
 * ```
 */
export class AppError<
  T extends VerboseStatusCode = VerboseStatusCode,
> extends Error {
  readonly name: 'AppError';
  readonly verboseCode: VerboseStatusCode;
  readonly hideToClient: boolean;
  readonly status: ContentfulStatusCode;

  constructor(verboseCode: T, options: AppErrorOptions = {}) {
    const mappedError = statusCodeMap[verboseCode];
    const status =
      options.statusCodeOverride ??
      mappedError?.status ??
      DEFAULT_ERROR_MAPPING.status;

    const finalMessage =
      options.message || mappedError?.message || DEFAULT_ERROR_MAPPING.message;
    super(finalMessage, {
      cause: options.cause,
    });

    Object.setPrototypeOf(this, AppError.prototype);

    this.status = status;
    this.name = 'AppError';
    this.verboseCode = verboseCode;
    this.hideToClient = options.hideToClient ?? false;
  }
}

/**
 * Custom error class to handle errors in the controller layer in a typesafe way, based on the OpenAPI definition of the endpoint handler.
 * The resulting status code and message are determined by the verbose error code if none are provided.
 * @class
 * @extends AppError
 *
 * @param code - The verbose status code of the error to throw.
 * @param options - Additional options for the error.
 * @example
 * ```ts
 * throw new EndpointError<typeof tasksRoutes.getTaskById>('INTERAL');
 * // Let's say the getTaskById accepts responses with codes 200, 400 and 404
 * // You will be able to only provide the corrisponding verbose status codes "OK" | "INTERNAL" | "NOT_FOUND"
```
 */
export class EndpointError<
  H extends ReturnType<typeof createRoute>,
> extends AppError {
  constructor(
    verboseCode: HandlerStatusCode<H>,
    options: AppErrorOptions = {},
  ) {
    super(verboseCode, options);
    Object.setPrototypeOf(this, EndpointError.prototype);
  }
}

const serializeError = (err: Error) => {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    cause: err.cause,
    ...(err instanceof AppError
      ? {
          verboseCode: err.verboseCode,
          status: err.status,
          hideToClient: err.hideToClient,
        }
      : {}),
  };
};

export const errorHandler = (err: Error | AppError, c: Context): Response => {
  console.error(
    `[${new Date().toISOString()}] Error:`,
    JSON.stringify(serializeError(err), null, 2),
  );

  if (err instanceof AppError) {
    const message: string =
      env.NODE_ENV === 'development' || !err.hideToClient
        ? err.message
        : (statusCodeMap[err.verboseCode]?.message ?? 'Internal Server Error');

    const cause: unknown =
      env.NODE_ENV === 'development' ? err.cause : undefined;
    const stack = env.NODE_ENV === 'development' ? err.stack : undefined;

    const errorResponse: ErrorResponse = {
      success: false,
      error: message,
      verboseCode: err.verboseCode,
      cause: cause,
      stack: stack,
    };

    return c.json(errorResponse, err.status);
  }

  // Handle unexpected errors
  return c.json(DEFAULT_ERROR_RESPONSE, DEFAULT_ERROR_MAPPING.status);
};
