import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import {
  insertTaskSchema,
  selectTaskSchema,
  updateTaskSchema,
} from './tasks.db';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import {
  getTasksQuerySchema,
  taskIdParamSchema,
  taskPrioritySchema,
  taskRecurringSchema,
  taskStatusSchema,
} from './tasks.types';
import { statusCodeMap } from 'utils/status-codes/';
import { createRequiredJsonBody } from 'utils/request/body/';

const getTasks = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getTasksQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema.array(),
      'Tasks fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Task not found'),
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
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,
      'Task fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Task not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Get a specific task by ID',
});

const createTask = createRoute({
  path: '/',
  method: 'post',
  request: {
    body: createRequiredJsonBody(insertTaskSchema, 'The task to create'),
  },
  responses: {
    [statusCodeMap['CREATED'].status]: createSuccessJsonResponse(
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
    body: createRequiredJsonBody(updateTaskSchema, 'The task to patch'),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,
      'Task updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
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
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never(),
      'Task deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be deleted was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Delete a task',
});

const updateTaskStatus = createRoute({
  path: '/:taskId/status',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
    body: createRequiredJsonBody(taskStatusSchema, 'The task status to patch'),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,

      'Task status updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Change task status (e.g., todo → in_progress)',
});

const updateTaskPriority = createRoute({
  path: '/:taskId/priority',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
    body: createRequiredJsonBody(
      taskPrioritySchema,
      'The task priority to patch',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,
      'Task priority updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Change task priority',
});

const updateTaskRecurringInterval = createRoute({
  path: '/:taskId/recurring/interval',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
    body: createRequiredJsonBody(
      taskRecurringSchema,
      'The task recurring interval to patch',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,

      'Task recurring interval updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
  },
  description: 'Set or update recurring interval',
});

const updateTaskIsRecurring = createRoute({
  path: '/:taskId/recurring/toggle',
  method: 'patch',
  request: {
    params: taskIdParamSchema,
    body: createRequiredJsonBody(
      z.boolean(),
      'The task recurring interval to patch',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema,

      'Task recurring interval updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponse('Error'),
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
  updateTaskRecurringInterval,
  updateTaskIsRecurring,
} as const satisfies AppRoutes;
