import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import {
  insertLabelSchema,
  insertTaskLabelsSchema,
  selectLabelSchema,
  updateLabelSchema,
} from './labels.db';
import { statusCodeMap } from 'utils/status-codes/';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { createRequiredJsonBody } from 'utils/request/body/';
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
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse('Label not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
});

const getLabelById = createRoute({
  path: '/:id',
  method: 'get',
  request: {
    params: z.object({ id: z.string() }),
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
});

const updateLabel = createRoute({
  path: '/:id',
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
});

const deleteLabel = createRoute({
  path: '/:id',
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
});

const assignLabelToTask = createRoute({
  path: '/tasks/:taskId/labels/:labelId',
  method: 'post',
  request: {
    params: insertTaskLabelsSchema,
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
});

const removeLabelFromTask = createRoute({
  path: '/tasks/:taskId/labels/:labelId',
  method: 'delete',
  request: {
    params: insertTaskLabelsSchema,
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
