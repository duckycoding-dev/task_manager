import { createRoute, z } from '@hono/zod-openapi';

import { checkAuthMiddleware } from 'utils/auth/';
import { includeDeletedQuerySchema } from 'utils/query-params/';
import { createRequiredJsonBody } from 'utils/request/body/';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { statusCodeMap } from 'utils/status-codes/';

import type { AppRoutes } from '../../types/app_context';

import {
  insertLabelSchema,
  insertTaskLabelsSchema,
  selectLabelSchema,
  updateLabelSchema,
} from './labels.db';
import {
  deleteLabelQuerySchema,
  getLabelsQuerySchema,
  labelIdParamSchema,
  labelWithTaskCountSchema,
} from './labels.types';

const getLabels = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getLabelsQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.array(labelWithTaskCountSchema),
      'Labels fetched',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const getLabelById = createRoute({
  path: '/:labelId',
  method: 'get',
  request: {
    params: labelIdParamSchema,
    query: includeDeletedQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectLabelSchema,
      'Label found',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    'Get a specific label by ID. A soft-deleted label is a 404 unless `includeDeleted=true` (ADR-0002).',
  middleware: checkAuthMiddleware,
});

const restoreLabel = createRoute({
  path: '/:labelId/restore',
  method: 'post',
  request: {
    params: labelIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectLabelSchema,
      'Label restored',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    'Restore a soft-deleted label (nulls `deletedAt`). Idempotent: restoring a live label succeeds. See ADR-0002.',
  middleware: checkAuthMiddleware,
});

const createLabel = createRoute({
  path: '/',
  method: 'post',
  request: {
    body: createRequiredJsonBody(insertLabelSchema, 'Label data is required'),
  },
  responses: {
    [statusCodeMap['CREATED'].status]: createSuccessJsonResponse(
      selectLabelSchema,
      'Label created',
    ),
    [statusCodeMap['BAD_REQUEST'].status]:
      createErrorResponse('Invalid label data'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const updateLabel = createRoute({
  path: '/:labelId',
  method: 'patch',
  request: {
    params: labelIdParamSchema,
    body: createRequiredJsonBody(updateLabelSchema, 'Label data is required'),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectLabelSchema,
      'Label updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['BAD_REQUEST'].status]:
      createErrorResponse('Invalid label data'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const deleteLabel = createRoute({
  path: '/:labelId',
  method: 'delete',
  request: {
    params: labelIdParamSchema,
    query: deleteLabelQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Label deleted',
    ),
    [statusCodeMap['BAD_REQUEST'].status]: createErrorResponse(
      '`removeFromTasks` and `permanent` cannot be combined',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['CONFLICT'].status]: createErrorResponse(
      'Only soft-deleted labels can be permanently deleted',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description:
    'Delete tiers per ADR-0007: bare call = soft delete keeping task links; `removeFromTasks=true` = soft delete + remove label from all tasks; `permanent=true` = permanent delete (allowed only when already soft-deleted).',
  middleware: checkAuthMiddleware,
});

const assignLabelToTask = createRoute({
  path: '/assign',
  method: 'post',
  request: {
    body: createRequiredJsonBody(
      insertTaskLabelsSchema,
      'Label and task IDs are required',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Label assigned to task',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'Task or label not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

const removeLabelFromTask = createRoute({
  path: '/unassign',
  method: 'delete',
  request: {
    body: createRequiredJsonBody(
      insertTaskLabelsSchema,
      'Label and task IDs are required',
    ),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Label removed from task',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'Task or label not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  middleware: checkAuthMiddleware,
});

export const labelsRoutes = {
  getLabelById,
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
  restoreLabel,
  assignLabelToTask,
  removeLabelFromTask,
} as const satisfies AppRoutes;
