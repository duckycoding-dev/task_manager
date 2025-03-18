import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ErrorResponse } from 'src/types/response';
import env from './env';

const DEFAULT_ERROR_MAPPING: ErrorMapping = {
  status: 500,
  message: 'Internal Server Error',
  code: 'INTERNAL',
};

const DEFAULT_ERROR_RESPONSE: ErrorResponse = {
  success: false,
  error: DEFAULT_ERROR_MAPPING.message,
  code: DEFAULT_ERROR_MAPPING.code,
};

export type ErrorCode =
  | 'CONTINUE'
  // | 'SWITCHING_PROTOCOLS'
  | 'PROCESSING'
  | 'EARLY_HINTS'
  | 'OK'
  | 'CREATED'
  | 'ACCEPTED'
  | 'NON_AUTHORITATIVE_INFORMATION'
  // | 'NO_CONTENT'
  // | 'RESET_CONTENT'
  | 'PARTIAL_CONTENT'
  | 'MULTI_STATUS'
  | 'ALREADY_REPORTED'
  | 'IM_USED'
  | 'MULTIPLE_CHOICES'
  | 'MOVED_PERMANENTLY'
  | 'FOUND'
  | 'SEE_OTHER'
  // | 'NOT_MODIFIED'
  | 'USE_PROXY'
  | 'TEMPORARY_REDIRECT'
  | 'PERMANENT_REDIRECT'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'ACCESS_DENIED'
  | 'SERVICE_FAILURE'
  | 'INTERNAL'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'GONE'
  | 'LENGTH_REQUIRED'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'URI_TOO_LONG'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'RANGE_NOT_SATISFIABLE'
  | 'EXPECTATION_FAILED'
  | 'IM_A_TEAPOT'
  | 'MISDIRECTED_REQUEST'
  | 'UNPROCESSABLE_ENTITY'
  | 'LOCKED'
  | 'FAILED_DEPENDENCY'
  | 'UPGRADE_REQUIRED'
  | 'PRECONDITION_REQUIRED'
  | 'TOO_MANY_REQUESTS'
  | 'REQUEST_HEADER_FIELDS_TOO_LARGE'
  | 'UNAVAILABLE_FOR_LEGAL_REASONS'
  | 'INTERNAL_SERVER_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'HTTP_VERSION_NOT_SUPPORTED'
  | 'VARIANT_ALSO_NEGOTIATES'
  | 'INSUFFICIENT_STORAGE'
  | 'LOOP_DETECTED'
  | 'NOT_EXTENDED'
  | 'NETWORK_AUTHENTICATION_REQUIRED'
  | (string & {}); // Allows custom error types in the future

export type ErrorMapping = {
  status: ContentfulStatusCode;
  message: string;
  code: ErrorCode;
};

const errorMap: Record<ErrorCode, ErrorMapping> = {
  CONTINUE: { status: 100, message: 'Continue', code: 'CONTINUE' },
  // SWITCHING_PROTOCOLS: {
  //   status: 101,
  //   message: 'Switching Protocols',
  //   code: 'SWITCHING_PROTOCOLS',
  // },
  PROCESSING: { status: 102, message: 'Processing', code: 'PROCESSING' },
  EARLY_HINTS: { status: 103, message: 'Early Hints', code: 'EARLY_HINTS' },
  OK: { status: 200, message: 'OK', code: 'OK' },
  CREATED: { status: 201, message: 'Created', code: 'CREATED' },
  ACCEPTED: { status: 202, message: 'Accepted', code: 'ACCEPTED' },
  NON_AUTHORITATIVE_INFORMATION: {
    status: 203,
    message: 'Non-Authoritative Information',
    code: 'NON_AUTHORITATIVE_INFORMATION',
  },
  // NO_CONTENT: { status: 204, message: 'No Content', code: 'NO_CONTENT' },
  // RESET_CONTENT: {
  //   status: 205,
  //   message: 'Reset Content',
  //   code: 'RESET_CONTENT',
  // },
  PARTIAL_CONTENT: {
    status: 206,
    message: 'Partial Content',
    code: 'PARTIAL_CONTENT',
  },
  MULTI_STATUS: { status: 207, message: 'Multi-Status', code: 'MULTI_STATUS' },
  ALREADY_REPORTED: {
    status: 208,
    message: 'Already Reported',
    code: 'ALREADY_REPORTED',
  },
  IM_USED: { status: 226, message: 'IM Used', code: 'IM_USED' },
  MULTIPLE_CHOICES: {
    status: 300,
    message: 'Multiple Choices',
    code: 'MULTIPLE_CHOICES',
  },
  MOVED_PERMANENTLY: {
    status: 301,
    message: 'Moved Permanently',
    code: 'MOVED_PERMANENTLY',
  },
  FOUND: { status: 302, message: 'Found', code: 'FOUND' },
  SEE_OTHER: { status: 303, message: 'See Other', code: 'SEE_OTHER' },
  // NOT_MODIFIED: { status: 304, message: 'Not Modified', code: 'NOT_MODIFIED' },
  USE_PROXY: { status: 305, message: 'Use Proxy', code: 'USE_PROXY' },
  TEMPORARY_REDIRECT: {
    status: 307,
    message: 'Temporary Redirect',
    code: 'TEMPORARY_REDIRECT',
  },
  PERMANENT_REDIRECT: {
    status: 308,
    message: 'Permanent Redirect',
    code: 'PERMANENT_REDIRECT',
  },
  NOT_FOUND: { status: 404, message: 'Resource not found', code: 'NOT_FOUND' },
  VALIDATION: { status: 400, message: 'Invalid input', code: 'VALIDATION' },
  ACCESS_DENIED: {
    status: 403,
    message: 'Access denied',
    code: 'ACCESS_DENIED',
  },
  SERVICE_FAILURE: {
    status: 503,
    message: 'External service failure',
    code: 'SERVICE_FAILURE',
  },
  INTERNAL: DEFAULT_ERROR_MAPPING,
  BAD_REQUEST: { status: 400, message: 'Bad request', code: 'BAD_REQUEST' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
  FORBIDDEN: { status: 403, message: 'Forbidden', code: 'FORBIDDEN' },
  CONFLICT: { status: 409, message: 'Conflict', code: 'CONFLICT' },
  GONE: { status: 410, message: 'Gone', code: 'GONE' },
  LENGTH_REQUIRED: {
    status: 411,
    message: 'Length required',
    code: 'LENGTH_REQUIRED',
  },
  PRECONDITION_FAILED: {
    status: 412,
    message: 'Precondition failed',
    code: 'PRECONDITION_FAILED',
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    message: 'Payload too large',
    code: 'PAYLOAD_TOO_LARGE',
  },
  URI_TOO_LONG: { status: 414, message: 'URI too long', code: 'URI_TOO_LONG' },
  UNSUPPORTED_MEDIA_TYPE: {
    status: 415,
    message: 'Unsupported media type',
    code: 'UNSUPPORTED_MEDIA_TYPE',
  },
  RANGE_NOT_SATISFIABLE: {
    status: 416,
    message: 'Range not satisfiable',
    code: 'RANGE_NOT_SATISFIABLE',
  },
  EXPECTATION_FAILED: {
    status: 417,
    message: 'Expectation failed',
    code: 'EXPECTATION_FAILED',
  },
  IM_A_TEAPOT: { status: 418, message: "I'm a teapot", code: 'IM_A_TEAPOT' },
  MISDIRECTED_REQUEST: {
    status: 421,
    message: 'Misdirected request',
    code: 'MISDIRECTED_REQUEST',
  },
  UNPROCESSABLE_ENTITY: {
    status: 422,
    message: 'Unprocessable entity',
    code: 'UNPROCESSABLE_ENTITY',
  },
  LOCKED: { status: 423, message: 'Locked', code: 'LOCKED' },
  FAILED_DEPENDENCY: {
    status: 424,
    message: 'Failed dependency',
    code: 'FAILED_DEPENDENCY',
  },
  UPGRADE_REQUIRED: {
    status: 426,
    message: 'Upgrade required',
    code: 'UPGRADE_REQUIRED',
  },
  PRECONDITION_REQUIRED: {
    status: 428,
    message: 'Precondition required',
    code: 'PRECONDITION_REQUIRED',
  },
  TOO_MANY_REQUESTS: {
    status: 429,
    message: 'Too many requests',
    code: 'TOO_MANY_REQUESTS',
  },
  REQUEST_HEADER_FIELDS_TOO_LARGE: {
    status: 431,
    message: 'Request header fields too large',
    code: 'REQUEST_HEADER_FIELDS_TOO_LARGE',
  },
  UNAVAILABLE_FOR_LEGAL_REASONS: {
    status: 451,
    message: 'Unavailable for legal reasons',
    code: 'UNAVAILABLE_FOR_LEGAL_REASONS',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
  },
  NOT_IMPLEMENTED: {
    status: 501,
    message: 'Not Implemented',
    code: 'NOT_IMPLEMENTED',
  },
  BAD_GATEWAY: { status: 502, message: 'Bad Gateway', code: 'BAD_GATEWAY' },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: 'Service Unavailable',
    code: 'SERVICE_UNAVAILABLE',
  },
  GATEWAY_TIMEOUT: {
    status: 504,
    message: 'Gateway Timeout',
    code: 'GATEWAY_TIMEOUT',
  },
  HTTP_VERSION_NOT_SUPPORTED: {
    status: 505,
    message: 'HTTP Version Not Supported',
    code: 'HTTP_VERSION_NOT_SUPPORTED',
  },
  VARIANT_ALSO_NEGOTIATES: {
    status: 506,
    message: 'Variant Also Negotiates',
    code: 'VARIANT_ALSO_NEGOTIATES',
  },
  INSUFFICIENT_STORAGE: {
    status: 507,
    message: 'Insufficient Storage',
    code: 'INSUFFICIENT_STORAGE',
  },
  LOOP_DETECTED: {
    status: 508,
    message: 'Loop Detected',
    code: 'LOOP_DETECTED',
  },
  NOT_EXTENDED: { status: 510, message: 'Not Extended', code: 'NOT_EXTENDED' },
  NETWORK_AUTHENTICATION_REQUIRED: {
    status: 511,
    message: 'Network Authentication Required',
    code: 'NETWORK_AUTHENTICATION_REQUIRED',
  },
} as const;

type AppErrorOptions = {
  message?: string;
  hideToClient?: boolean;
  statusCodeOverride?: ContentfulStatusCode;
  cause?: unknown;
};

/**
 * Custom error class to handle application-specific errors.
 * The resulting status code and message are determined by the error type if none are provided.
 * @class
 * @param type - The type of error to throw.
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
 */
export class AppError extends Error {
  readonly name: 'AppError';
  readonly code: ErrorCode;
  readonly hideToClient: boolean;
  readonly status: ContentfulStatusCode;

  constructor(
    code: ErrorCode = DEFAULT_ERROR_MAPPING.code,
    options: AppErrorOptions = {},
  ) {
    const mappedError = errorMap[code];
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
    this.code = code;
    this.hideToClient = options.hideToClient ?? false;
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
          code: err.code,
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
        : (errorMap[err.code]?.message ?? 'Internal Server Error');

    const cause: unknown =
      env.NODE_ENV === 'development' ? err.cause : undefined;
    const stack = env.NODE_ENV === 'development' ? err.stack : undefined;

    const errorResponse: ErrorResponse = {
      success: false,
      error: message,
      code: err.code,
      cause: cause,
      stack: stack,
    };

    return c.json(errorResponse, err.status);
  }

  // Handle unexpected errors
  return c.json(DEFAULT_ERROR_RESPONSE, DEFAULT_ERROR_MAPPING.status);
};
