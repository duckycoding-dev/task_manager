import { createRoute } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { selectTaskSchema } from './tasks.db';
import { createErrorResponse, createJsonResponse } from 'utils/response/';
import { getTasksQuerySchema, taskIdParamSchema } from './tasks.types';
import { statusCodeMap } from 'utils/status-codes/';

const getTasks = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getTasksQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema.array(),
      'Tasks fetched',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Get all tasks for the authenticated user',
});

const getTaskById = createRoute({
  path: '/:taskId',
  method: 'get',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Task fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Task not found'),
  },
  description: 'Get a specific task by ID',
});

const createTask = createRoute({
  path: '/',
  method: 'post',
  responses: {
    [statusCodeMap['CREATED'].status]: createJsonResponse(
      selectTaskSchema,
      'Task created',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Create a new task (with optional project)',
});

const updateTask = createRoute({
  path: '/:taskId',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Task updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
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
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Task deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be deleted was not found',
    ),
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
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,

      'Task status updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
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
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Task priority updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
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
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,

      'Task recurring interval updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
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
