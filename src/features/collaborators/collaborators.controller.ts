import type { CollaboratorsService } from './collaborators.service';
import { collaboratorsRoutes } from './collaborators.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type CollaboratorsController = {
  get: AppRouteHandler<typeof collaboratorsRoutes.get>;
  // ... other methods
};

export const createCollaboratorsController = (
  collaboratorsService: CollaboratorsService,
): CollaboratorsController => {
  return {
    get: async (c) => {
      const { id } = c.req.valid('param');
      const result = await collaboratorsService.get(id);
      return c.json(result);
    },
  };
};
