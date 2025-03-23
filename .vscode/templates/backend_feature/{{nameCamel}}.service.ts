import { AppError } from '../../utils/errors';
import type { {{namePascal}}Repository } from './{{nameCamel}}.repository';
import type { {{namePascal}} } from './{{nameCamel}}.db';

export type {{namePascal}}Service = {
  get: (id: string) => Promise<{{namePascal}}>;
  // ... other methods
};

export const create{{namePascal}}Service = (
  {{nameCamel}}Repository: {{namePascal}}Repository,
): {{namePascal}}Service => {
  return {
    get: async (id) => {
      const data = await {{nameCamel}}Repository.get(id);
      if (!data) {
        throw new AppError('NOT_FOUND', {
          message: 'not found',
        });
      }
      return data;
    },
  };
};
