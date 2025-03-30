import { AppError } from '../../utils/errors/http-errors';
import type { LabelsRepository } from './labels.repository';
import type { Labels } from './labels.db';

export type LabelsService = {
  get: (id: string) => Promise<Labels>;
  // ... other methods
};

export const createLabelsService = (
  labelsRepository: LabelsRepository,
): LabelsService => {
  return {
    get: async (id) => {
      const data = await labelsRepository.get(id);
      if (!data) {
        throw new AppError('NOT_FOUND', {
          message: 'not found',
        });
      }
      return data;
    },
  };
};
