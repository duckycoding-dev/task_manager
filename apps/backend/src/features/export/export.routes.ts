import { createRoute } from '@hono/zod-openapi';

import { checkAuthMiddleware } from 'utils/auth/';
import { includeDeletedQuerySchema } from 'utils/query-params/';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { statusCodeMap } from 'utils/status-codes/';

import type { AppRoutes } from '../../types/app_context';

import { preferencesExportSchema, tasksExportSchema } from './export.types';

const exportTasks = createRoute({
  path: '/tasks',
  method: 'get',
  request: {
    query: includeDeletedQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      tasksExportSchema,
      'Tasks exported',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    "JSON bundle of the authenticated user's data (tasks, reminders, projects, labels, task-label links). `includeDeleted=true` includes soft-deleted rows.",
  middleware: checkAuthMiddleware,
});

const exportPreferences = createRoute({
  path: '/preferences',
  method: 'get',
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      preferencesExportSchema,
      'Preferences exported',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    'JSON blob of user preferences. v1: preferences are localStorage-backed, so the server returns an empty blob; a real store lands with the v1.5 users/preferences work.',
  middleware: checkAuthMiddleware,
});

export const exportRoutes = {
  exportTasks,
  exportPreferences,
} as const satisfies AppRoutes;
