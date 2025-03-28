import { createRoute } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { selectTaskSchema } from './tasks.db';
import {
  createErrorResponseDefinition,
  createSuccessResponseDefinition,
} from 'utils/response/';
import { getTasksQuerySchema, taskIdParamSchema } from './tasks.types';

const getTasks = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getTasksQuerySchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema.array(), {
      status: 'OK',
      description: 'Success',
    }),
    ...createErrorResponseDefinition({
      description: 'Error',
      status: 'INTERNAL_SERVER_ERROR',
    }),
  },
  description: 'Get all tasks for the authenticated user',
});

const createTask = createRoute({
  path: '/',
  method: 'post',
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'CREATED',
      description: 'Task created successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'Error',
      status: 'INTERNAL_SERVER_ERROR',
    }),
  },
  description: 'Create a new task (with optional project)',
});

const getTaskById = createRoute({
  path: '/:taskId',
  method: 'get',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Success',
    }),
    ...createErrorResponseDefinition({
      description: 'The searched task was not found',
      status: 'NOT_FOUND',
    }),
  },
  description: 'Get a specific task by ID',
});

const updateTask = createRoute({
  path: '/:taskId',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Task updated successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'The task to be patched was not found',
      status: 'NOT_FOUND',
    }),
  },
  description:
    'Update task details (title, description, status, priority, dueDate, etc.)',
});

const deleteTask = createRoute({
  path: '/:taskId',
  method: 'delete',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Task deleted successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'The task to be deleted was not found',
      status: 'NOT_FOUND',
    }),
  },
  description: 'Delete a task',
});

const updateTaskStatus = createRoute({
  path: '/:taskId/status',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Task status updated successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'The task to be patched was not found',
      status: 'NOT_FOUND',
    }),
  },
  description: 'Change task status (e.g., todo → in_progress)',
});

const updateTaskPriority = createRoute({
  path: '/:taskId/priority',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Task priority updated successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'The task to be patched was not found',
      status: 'NOT_FOUND',
    }),
  },
  description: 'Change task priority',
});

const updateTaskRecurring = createRoute({
  path: '/:taskId/recurring',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    ...createSuccessResponseDefinition(selectTaskSchema, {
      status: 'OK',
      description: 'Task recurring interval updated successfully',
    }),
    ...createErrorResponseDefinition({
      description: 'The task to be patched was not found',
      status: 'NOT_FOUND',
    }),
  },
  description: 'Set or update recurring interval',
});

export const tasksRoutes = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskRecurring,
} as const satisfies AppRoutes;
