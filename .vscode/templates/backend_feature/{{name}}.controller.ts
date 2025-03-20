import type { {{namePascal}}Service } from './{{nameCamel}}.service';
import { {{nameCamel}}Routes } from './{{nameCamel}}.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type {{namePascal}}Controller = {
  get: AppRouteHandler<typeof {{nameCamel}}Routes.get>;
  // ... other methods
};

export const create{{namePascal}}Controller = (
  {{nameCamel}}Service: {{namePascal}}Service,
): {{namePascal}}Controller => {
  return {
    get: async (c) => {
      const { id } = c.req.valid('param');
      const result = await {{nameCamel}}Service.get(id);
      return c.json(result);
    },
  };
};
