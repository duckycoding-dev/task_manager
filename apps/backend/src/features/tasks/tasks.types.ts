import { z } from 'zod/v4';

import {
  PRIORITY_OPTIONS,
  RECURRING_OPTIONS,
  STATUS_OPTIONS,
} from './tasks.db';

// 📌 Query Params Schemas
export const getTasksQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(STATUS_OPTIONS).optional(),
  priority: z.enum(PRIORITY_OPTIONS).optional(),
  dueDate: z.string().datetime().optional(),
});

// 📌 Path Params Schemas
export const taskIdParamSchema = z.object({
  taskId: z.string().uuid('Task id should be a valid uuid'),
});
export const projectIdParamSchema = z.object({ projectId: z.string().uuid() });
export const getProjectTasksParamsSchema = z.object({
  projectId: z.string().uuid(),
});

export const taskStatusSchema = z.enum(STATUS_OPTIONS);
export const taskPrioritySchema = z.enum(PRIORITY_OPTIONS);
export const taskRecurringSchema = z.enum(RECURRING_OPTIONS);

// 📌 Types
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type GetProjectTasksParams = z.infer<typeof getProjectTasksParamsSchema>;
export type TaskStatusOption = z.infer<typeof taskStatusSchema>;
export type TaskPriorityOption = z.infer<typeof taskPrioritySchema>;
export type TaskRecurringOption = z.infer<typeof taskRecurringSchema>;
