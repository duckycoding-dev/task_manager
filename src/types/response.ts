import type { ErrorCode } from 'src/utils/errors';

// Generic wrapper for all API responses
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Success response type
export type SuccessResponse<T> = {
  success: true;
  data: T;
  // Optional metadata like pagination info, etc.
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    // ... other metadata
  };
};

// Your existing error response type, enhanced
export type ErrorResponse = {
  success: false;
  error: string;
  code: ErrorCode;
  cause?: unknown;
  stack?: string;
};
