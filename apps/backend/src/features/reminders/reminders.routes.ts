import { createRoute, z } from '@hono/zod-openapi';

import { checkAuthMiddleware } from 'utils/auth/';
import { createRequiredJsonBody } from 'utils/request/body/';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { statusCodeMap } from 'utils/status-codes/';

import type { AppRoutes } from '../../types/app_context';
import { taskIdParamSchema } from '../tasks/tasks.types';

import {
  insertReminderSchema,
  selectReminderSchema,
  updateReminderSchema,
} from './reminders.db';
import {
  getRemindersQuerySchema,
  reminderIdParamSchema,
} from './reminders.types';

const getReminders = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getRemindersQuerySchema,
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

const getReminderById = createRoute({
  path: '/:reminderId',
  method: 'get',
  request: {
    params: reminderIdParamSchema,
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

const createReminder = createRoute({
  path: '/',
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
  path: '/:reminderId',
  method: 'delete',
  request: {
    params: reminderIdParamSchema,
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
  path: '/:reminderId',
  method: 'patch',
  request: {
    params: reminderIdParamSchema,
    body: createRequiredJsonBody(
      updateReminderSchema.extend({
        taskId: z.uuid(),
      }),
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
  createReminder,
  deleteReminder,
  updateReminder,
} as const satisfies AppRoutes;
