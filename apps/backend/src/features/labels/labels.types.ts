import { extendZodWithOpenApi } from '@hono/zod-openapi';
import { z } from 'zod/v4';

extendZodWithOpenApi(z);

// 📌 Query Params Schemas
export const getLabelsQuerySchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  color: z.string().optional(),
});
export const getLabelByIdQuerySchema = z.object({
  id: z.string().uuid('Label id should be a valid uuid'),
});

// 📌 Path Params Schemas
export const labelIdParamSchema = z.object({
  labelId: z.string().uuid('Label id should be a valid uuid'),
});

// 📌 Types
export type GetLabelsQuery = z.infer<typeof getLabelsQuerySchema>;
export type GetLabelByIdQuery = z.infer<typeof getLabelByIdQuerySchema>;
export type LabelIdParam = z.infer<typeof labelIdParamSchema>;
