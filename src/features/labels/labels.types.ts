import { z } from 'zod';
import {} from './labels.db';

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
export type GetLabelsResponse = {
  id: string;
  name: string;
  color: string;
}[];
export type GetLabelByIdResponse = {
  id: string;
  name: string;
  color: string;
} | null;
export type CreateLabelRequest = {
  name: string;
  color: string;
};
export type CreateLabelResponse = {
  id: string;
  name: string;
  color: string;
};
export type UpdateLabelRequest = {
  name?: string;
  color?: string;
};
export type UpdateLabelResponse = {
  id: string;
  name: string;
  color: string;
} | null;
export type DeleteLabelResponse = {
  success: boolean;
};
export type AssignLabelToTaskRequest = {
  taskId: string;
  labelId: string;
};
export type AssignLabelToTaskResponse = {
  success: boolean;
  message: string;
};
export type RemoveLabelFromTaskRequest = {
  taskId: string;
  labelId: string;
};
export type RemoveLabelFromTaskResponse = {
  success: boolean;
  message: string;
};
