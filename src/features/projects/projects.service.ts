import { AppError } from '../../utils/errors';
import type { ProjectsRepository } from './projects.repository';
import type { Projects } from './projects.db';

export type ProjectsService = {
  get: (id: string) => Promise<Projects>;
  // ... other methods
};

export const createProjectsService = (
  projectsRepository: ProjectsRepository,
): ProjectsService => {
  return {
    get: async (id) => {
      const data = await projectsRepository.get(id);
      if (!data) {
        throw new AppError('NOT_FOUND', {
          message: 'not found',
        });
      }
      return data;
    },
  };
};
