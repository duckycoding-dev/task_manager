import { AUTH_CTX_KEYS } from 'utils/auth-context/';

import type { AppRouteHandler } from '../../types/app_context';

import { type labelsRoutes } from './labels.routes';
import type { LabelsService } from './labels.service';

export type LabelsController = {
  getLabels: AppRouteHandler<typeof labelsRoutes.getLabels>;
  getLabelById: AppRouteHandler<typeof labelsRoutes.getLabelById>;
  createLabel: AppRouteHandler<typeof labelsRoutes.createLabel>;
  updateLabel: AppRouteHandler<typeof labelsRoutes.updateLabel>;
  deleteLabel: AppRouteHandler<typeof labelsRoutes.deleteLabel>;
  assignLabelToTask: AppRouteHandler<typeof labelsRoutes.assignLabelToTask>;
  removeLabelFromTask: AppRouteHandler<typeof labelsRoutes.removeLabelFromTask>;
};

export const createLabelsController = (
  labelsService: LabelsService,
): LabelsController => {
  return {
    getLabelById: async (c) => {
      const { labelId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const label = await labelsService.getLabelById(userId, labelId);
      return c.json(
        {
          success: true,
          data: label,
          message: 'Label fetched',
        },
        200,
      );
    },
    getLabels: async (c) => {
      const filters = c.req.valid('query');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const labelsFound = await labelsService.getLabels(userId, filters);
      return c.json(
        {
          success: true,
          data: labelsFound,
          message: 'Labels fetched',
        },
        200,
      );
    },
    createLabel: async (c) => {
      const label = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const labelCreated = await labelsService.createLabel(userId, label);
      return c.json(
        {
          success: true,
          data: labelCreated,
          message: 'Label created',
        },
        201,
      );
    },
    updateLabel: async (c) => {
      const { labelId } = c.req.valid('param');
      const labelUpdate = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const labelUpdated = await labelsService.updateLabel(
        userId,
        labelId,
        labelUpdate,
      );
      return c.json(
        {
          success: true,
          data: labelUpdated,
          message: 'Label updated',
        },
        200,
      );
    },
    deleteLabel: async (c) => {
      const { labelId } = c.req.valid('param');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      await labelsService.deleteLabel(userId, labelId);
      return c.json(
        {
          success: true,
          message: 'Label deleted',
        },
        200,
      );
    },
    assignLabelToTask: async (c) => {
      const { taskId, labelId } = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      await labelsService.assignLabelToTask(userId, taskId, labelId);
      return c.json(
        {
          success: true,
          message: 'Label assigned to task',
        },
        200,
      );
    },
    removeLabelFromTask: async (c) => {
      const { taskId, labelId } = c.req.valid('json');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      await labelsService.removeLabelFromTask(userId, taskId, labelId);
      return c.json(
        {
          success: true,
          message: 'Label removed from task',
        },
        200,
      );
    },
  };
};
