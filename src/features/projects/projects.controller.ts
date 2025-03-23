import type { ProjectsService } from './projects.service';
import { projectsRoutes } from './projects.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type ProjectsController = {
  get: AppRouteHandler<typeof projectsRoutes.get>;
  // ... other methods
};

export const createProjectsController = (
  projectsService: ProjectsService,
): ProjectsController => {
  return {
    get: async (c) => {
      const { id } = c.req.valid('param');
      const result = await projectsService.get(id);
      return c.json(result);
    },
  };
};
