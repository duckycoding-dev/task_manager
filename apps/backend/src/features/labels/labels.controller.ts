import type { LabelsService } from './labels.service';
import { labelsRoutes } from './labels.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

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
      const { id } = c.req.valid('param');
      const { id: userId } = c.get('user');
      const labelFound = await labelsService.getLabelById(userId, id);
      if (!labelFound) {
        throw new EndpointError<typeof labelsRoutes.getLabelById>('NOT_FOUND', {
          message: 'Label not found',
        });
      }
      return c.json(
        {
          success: true,
          data: labelFound,
          message: 'Label fetched',
        },
        200,
      );
    },
    getLabels: async (c) => {
      const filters = c.req.valid('query');
      const { id: userId } = c.get('user');
      const labelsFound = await labelsService.getLabels(userId, filters);
      if (labelsFound.length === 0) {
        throw new EndpointError<typeof labelsRoutes.getLabels>('NOT_FOUND', {
          message: 'No labels found',
        });
      }
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
      const { id: userId } = c.get('user');
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
      const { id: userId } = c.get('user');
      const labelUpdated = await labelsService.updateLabel(
        userId,
        labelId,
        labelUpdate,
      );
      if (!labelUpdated) {
        throw new EndpointError<typeof labelsRoutes.updateLabel>('NOT_FOUND', {
          message: 'Label not found',
        });
      }
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
      const { id: userId } = c.get('user');
      const labelWasDeleted = await labelsService.deleteLabel(userId, labelId);
      if (!labelWasDeleted) {
        throw new EndpointError<typeof labelsRoutes.deleteLabel>('NOT_FOUND', {
          message: 'Label not found',
        });
      }
      return c.json(
        {
          success: true,
          message: 'Label deleted',
        },
        200,
      );
    },
    assignLabelToTask: async (c) => {
      const { taskId, labelId } = c.req.valid('param');
      const { id: userId } = c.get('user');
      const labelWasAssigned = await labelsService.assignLabelToTask(
        userId,
        taskId,
        labelId,
      );
      if (!labelWasAssigned) {
        throw new EndpointError<typeof labelsRoutes.assignLabelToTask>(
          'NOT_FOUND',
          {
            message: 'Label not found',
          },
        );
      }
      return c.json(
        {
          success: true,
          message: 'Label assigned to task',
        },
        200,
      );
    },
    removeLabelFromTask: async (c) => {
      const { taskId, labelId } = c.req.valid('param');
      const { id: userId } = c.get('user');
      const labelWasRemoved = await labelsService.removeLabelFromTask(
        userId,
        taskId,
        labelId,
      );
      if (!labelWasRemoved) {
        throw new EndpointError<typeof labelsRoutes.removeLabelFromTask>(
          'NOT_FOUND',
          {
            message: 'Label not found',
          },
        );
      }
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
