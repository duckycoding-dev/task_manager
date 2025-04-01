import { createRoute, z } from '@hono/zod-openapi';
import type { AppRoutes } from '../../types/app_context';
import {
  insertProjectSchema,
  selectProjectSchema,
  updateProjectSchema,
} from './projects.db';
import {
  createErrorResponse,
  createSuccessJsonResponse,
} from 'utils/response/';
import { statusCodeMap } from 'utils/status-codes/';
import { createRequiredJsonBody } from 'utils/request/body/';
import { projectIdParamSchema } from './projects.types';
import { selectTaskSchema } from '../tasks/tasks.db';

const getProjects = createRoute({
  path: '/',
  method: 'get',
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectProjectSchema.array(),
      'Projects fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('Projects not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Get all projects for the authenticated user',
});

const getProjectById = createRoute({
  path: '/:projectId',
  method: 'get',
  request: {
    params: projectIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectProjectSchema,
      'Project fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]:
      createErrorResponse('Project not found'),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Get a specific project by ID',
});

const createProject = createRoute({
  path: '/',
  method: 'post',
  request: {
    body: createRequiredJsonBody(insertProjectSchema, 'The project to create'),
  },
  responses: {
    [statusCodeMap['CREATED'].status]: createSuccessJsonResponse(
      selectProjectSchema,
      'Project created',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Create a new project',
});

const updateProject = createRoute({
  path: '/:projectId',
  method: 'patch',
  request: {
    params: projectIdParamSchema,
    body: createRequiredJsonBody(updateProjectSchema, 'The project to patch'),
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectProjectSchema,
      'Project updated',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The project to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Update project details (name, description)',
});

const deleteProject = createRoute({
  path: '/:projectId',
  method: 'delete',
  request: {
    params: projectIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      z.never().openapi({ type: 'null' }),
      'Project deleted',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The project to be deleted was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Delete a project (set projectId to NULL in associated tasks)',
});

const getProjectTasks = createRoute({
  path: '/:projectId/tasks',
  method: 'get',
  request: {
    params: projectIdParamSchema,
  },
  responses: {
    [statusCodeMap['OK'].status]: createSuccessJsonResponse(
      selectTaskSchema.array(),
      'Tasks fetched',
    ),
    [statusCodeMap['NOT_FOUND'].status]: createErrorResponse(
      'The project to be patched was not found',
    ),
    [statusCodeMap['INTERNAL_SERVER_ERROR'].status]: createErrorResponse(
      statusCodeMap['INTERNAL_SERVER_ERROR'].message,
    ),
  },
  description: 'Get all tasks for a specific project',
});

export const projectsRoutes = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
} as const satisfies AppRoutes;
