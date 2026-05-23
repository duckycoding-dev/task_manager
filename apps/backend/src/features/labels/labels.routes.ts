import { createRoute, z } from '@hono/zod-openapi';

import { checkAuthMiddleware } from 'utils/auth/';
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
import { getLabelsQuerySchema, labelIdParamSchema } from './labels.types';

const getLabels = createRoute({
  path: '/',
  method: 'get',
  request: {
    query: getLabelsQuerySchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.array(selectLabelSchema),
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
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Label deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
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
  assignLabelToTask,
  removeLabelFromTask,
} as const satisfies AppRoutes;
