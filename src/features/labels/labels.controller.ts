import type { LabelsService } from './labels.service';
import { labelsRoutes } from './labels.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type LabelsController = {
  get: AppRouteHandler<typeof labelsRoutes.get>;
  // ... other methods
};

export const createLabelsController = (
  labelsService: LabelsService,
): LabelsController => {
  return {
    get: async (c) => {
      const { id } = c.req.valid('param');
      const result = await labelsService.get(id);
      return c.json(result);
    },
  };
};
