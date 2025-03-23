import { z } from 'zod';
import {
  statusOptions,
  priorityOptions,
  type NewTask,
  type Task,
  type UpdateTask,
} from './tasks.db';

// 📌 Query Params Schemas
export const getTasksQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(statusOptions).optional(),
  priority: z.enum(priorityOptions).optional(),
  dueDate: z.string().datetime().optional(),
});

// 📌 Path Params Schemas
export const getTaskParamsSchema = z.object({
  taskId: z.string().uuid(),
});
export const taskIdParamSchema = z.object({ taskId: z.string().uuid() });
export const projectIdParamSchema = z.object({ projectId: z.string().uuid() });
export const updateTaskParamsSchema = z.object({
  taskId: z.string().uuid(),
});
export const deleteTaskParamsSchema = z.object({
  taskId: z.string().uuid(),
});
export const markTaskDoneParamsSchema = z.object({
  taskId: z.string().uuid(),
});
export const getProjectTasksParamsSchema = z.object({
  projectId: z.string().uuid(),
});

// 📌 Types
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type GetTaskParams = z.infer<typeof getTaskParamsSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;

export type UpdateTaskParams = z.infer<typeof updateTaskParamsSchema>;
export type DeleteTaskParams = z.infer<typeof deleteTaskParamsSchema>;
export type MarkTaskDoneParams = z.infer<typeof markTaskDoneParamsSchema>;
export type GetProjectTasksParams = z.infer<typeof getProjectTasksParamsSchema>;

export type GetTasksResponse = Task[];
export type GetTaskResponse = Task;
export type CreateTaskRequest = NewTask;
export type CreateTaskResponse = Task;
export type UpdateTaskRequest = UpdateTask;
export type UpdateTaskResponse = Task;
export type DeleteTaskResponse = { success: boolean };
export type MarkTaskDoneResponse = Task;
export type GetProjectTasksResponse = Task[];
export type GetOverdueTasksResponse = Task[];
