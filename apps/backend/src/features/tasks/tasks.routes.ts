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
import { checkAuthMiddleware } from 'utils/auth/';
import { selectReminderSchema } from '../reminders';

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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Get all tasks for the authenticated user',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Get a specific task by ID',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Create a new task (with optional project)',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    'Update task details (title, description, status, priority, dueDate, etc.)',
  middleware: checkAuthMiddleware,
});

const deleteTask = createRoute({
  path: '/:taskId',
  method: 'delete',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Task deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The task to be deleted was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Delete a task',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Change task status (e.g., todo → in_progress)',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Change task priority',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Set or update recurring interval',
  middleware: checkAuthMiddleware,
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
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Set or update recurring interval',
  middleware: checkAuthMiddleware,
});

const getTaskReminders = createRoute({
  path: '/:taskId/reminders',
  method: 'get',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectReminderSchema.array(),
      'Reminders fetched',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
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
  getTaskReminders,
} as const satisfies AppRoutes;
