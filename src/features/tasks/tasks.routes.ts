import { createRoute } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import { selectTaskSchema } from './tasks.db';
import {
  createErrorResponseDefinition,
  createJsonResponse,
} from 'utils/response/';
import { getTasksQuerySchema, taskIdParamSchema } from './tasks.types';
import { ErrorResponseSchema } from 'types/response/';
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
      'Success',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponseDefinition('Error'),
  },
  description: 'Get all tasks for the authenticated user',
});

const createTask = createRoute({
  path: '/',
  method: 'post',
  responses: {
    [statusCodeMap['CREATED'].status]: createJsonResponse(
      selectTaskSchema,
      'Task created successfully',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]:
      createErrorResponseDefinition('Error'),
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
    [statusCodeMap['NOT_FOUND'].status]: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Task not found',
    },
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Success',
    ),
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
    [statusCodeMap['OK'].status]: createJsonResponse(
      selectTaskSchema,
      'Task updated successfully',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponseDefinition(
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
      'Task deleted successfully',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponseDefinition(
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

      'Task status updated successfully',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponseDefinition(
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
      'Task priority updated successfully',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponseDefinition(
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

      'Task recurring interval updated successfully',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponseDefinition(
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
