import { z } from 'zod/v4';

// 📌 Query Params Schemas
export const getLabelsQuerySchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  color: z.string().optional(),
  // When `true`, soft-deleted rows are included. Default `false` filters
  // `deleted_at IS NULL`. See ADR-0002.
  includeDeleted: z.stringbool().default(false),
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
