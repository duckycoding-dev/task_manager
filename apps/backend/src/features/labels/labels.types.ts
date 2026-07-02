import { z } from 'zod/v4';

import { selectLabelSchema } from './labels.db';

// 📌 Response Schemas
// List-endpoint shape: every label carries the count of LIVE tasks tagged
// with it (soft-deleted tasks excluded from the count).
export const labelWithTaskCountSchema = selectLabelSchema.extend({
  taskCount: z.number().int().nonnegative(),
});

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

// Delete tiers per ADR-0007 (all on DELETE /labels/:labelId):
// bare = soft delete keeping task links · `removeFromTasks=true` = soft
// delete + wipe join rows · `permanent=true` = hard delete (only if already
// soft-deleted) · both flags together = 400.
export const deleteLabelQuerySchema = z.object({
  removeFromTasks: z.stringbool().default(false),
  permanent: z.stringbool().default(false),
});

// 📌 Types
export type LabelWithTaskCount = z.infer<typeof labelWithTaskCountSchema>;
export type GetLabelsQuery = z.infer<typeof getLabelsQuerySchema>;
export type GetLabelByIdQuery = z.infer<typeof getLabelByIdQuerySchema>;
export type LabelIdParam = z.infer<typeof labelIdParamSchema>;
export type DeleteLabelQuery = z.infer<typeof deleteLabelQuerySchema>;
