import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import {
  insertReminderSchema,
  selectReminderSchema,
  updateReminderSchema,
} from './reminders.db';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { statusCodeMap } from 'utils/status-codes/';
import { taskIdParamSchema } from '../tasks/tasks.types';
import { createRequiredJsonBody } from 'utils/request/body/';
import { checkAuthMiddleware } from 'utils/auth/';

const getReminders = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: z.object({ id: z.string() }),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectReminderSchema.array(),
      'Reminders fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('No reminders found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const getReminderById = createRoute({
  path: '/:id',
  method: 'get',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectReminderSchema,
      'Reminder fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('No reminder found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const getRemindersByTaskId = createRoute({
  path: '/tasks/:taskId/reminders',
  method: 'get',
  request: {
    params: taskIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectReminderSchema.array(),
      'Reminders fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('No reminders found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const createReminder = createRoute({
  path: '/tasks/:taskId/reminders',
  method: 'post',
  request: {
    params: taskIdParamSchema,
    body: createRequiredJsonBody(
      insertReminderSchema,
      'The reminder to create for a given task',
    ),
  },
  responses: {
    [statusCodeMap['CREATED'].status]: createSuccessJsonResponse(
      selectReminderSchema,
      'Reminder created',
    ),
    [statusCodeMap['BAD_REQUEST'].status]:
      createErrorResponse('Invalid request'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const deleteReminder = createRoute({
  path: '/tasks/:taskId/reminders/:reminderId',
  method: 'delete',
  request: {
    params: selectReminderSchema.pick({
      taskId: true,
      id: true,
    }),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Reminder deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('Reminder not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Delete a reminder for a specific task',
  middleware: checkAuthMiddleware,
});

const updateReminder = createRoute({
  path: '/tasks/:taskId/reminders/:reminderId',
  method: 'patch',
  request: {
    params: selectReminderSchema.pick({
      taskId: true,
      id: true,
    }),
    body: createRequiredJsonBody(
      updateReminderSchema,
      'The reminder to update for a given task',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectReminderSchema,
      'Reminder updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('Reminder not found'),
    [statusCodeMap['BAD_REQUEST'].status]:
      createErrorResponse('Invalid request'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Update a reminder for a specific task',
  middleware: checkAuthMiddleware,
});

export const remindersRoutes = {
  getReminders,
  getReminderById,
  getRemindersByTaskId,
  createReminder,
  deleteReminder,
  updateReminder,
} as const satisfies AppRoutes;
