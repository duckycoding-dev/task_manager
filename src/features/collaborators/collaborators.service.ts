import { AppError } from '../../utils/errors/http-errors';
import type { CollaboratorsRepository } from './collaborators.repository';
import type { Collaborators } from './collaborators.db';

export type CollaboratorsService = {
  get: (id: string) => Promise<Collaborators>;
  // ... other methods
};

export const createCollaboratorsService = (
  collaboratorsRepository: CollaboratorsRepository,
): CollaboratorsService => {
  return {
    get: async (id) => {
      const data = await collaboratorsRepository.get(id);
      if (!data) {
        throw new AppError('NOT_FOUND', {
          message: 'not found',
        });
      }
      return data;
    },
  };
};
