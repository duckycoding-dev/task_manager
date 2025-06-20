import {
  verboseStatusCodes,
  type VerboseStatusCode,
} from 'utils/status-codes/';
import { z } from 'zod/v4';

// Metadata schema
export const ResponseMetaSchema = z.object({
  page: z.number().positive().optional(),
  limit: z.number().positive().optional(),
  total: z.number().nonnegative().optional(),
  totalPages: z.number().nonnegative().optional(),
  hasNextPage: z.boolean().optional(),
  hasPrevPage: z.boolean().optional(),
  count: z.number().nonnegative().optional(),
  cursor: z.string().optional(),
  requestId: z.string().optional(),
  processingTimeMs: z.number().nonnegative().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  sort: z
    .union([z.array(z.string()), z.record(z.string(), z.enum(['asc', 'desc']))])
    .optional(),
});

// Success response schema
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: ResponseMetaSchema.optional(),
    message: z.string().optional(),
  });

// Error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  verboseCode: z.enum(verboseStatusCodes),
  cause: z.any().optional(),
  stack: z.string().optional(),
});

// API response union schema
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([SuccessResponseSchema(dataSchema), ErrorResponseSchema]);

// Metadata interface with common pagination fields
export type ResponseMeta = z.infer<typeof ResponseMetaSchema>;
// Success response type

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: ResponseMeta;
  message?: string;
};

// I had to explicitly omit code from ErrorResponseSchema and redefine its type: without this it is not inferring the type correctly when using " | (string & {}})"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ErrorResponseSchemaWithoutVerboseCode = ErrorResponseSchema.omit({
  verboseCode: true,
});
export type ErrorResponse = z.infer<
  typeof ErrorResponseSchemaWithoutVerboseCode
> & {
  verboseCode: VerboseStatusCode;
};

// add to manually define this type because zod is not inferring it correctly wheh dealing with generics and it was causing issues around the codebase
// Generic wrapper for all API responses
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
