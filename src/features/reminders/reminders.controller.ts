import type { RemindersService } from './reminders.service';
import { remindersRoutes } from './reminders.routes';
import type { AppRouteHandler } from '../../types/app_context';

export type RemindersController = {
  get: AppRouteHandler<typeof remindersRoutes.get>;
  // ... other methods
};

export const createRemindersController = (
  remindersService: RemindersService,
): RemindersController => {
  return {
    get: async (c) => {
      const { id } = c.req.valid('param');
      const result = await remindersService.get(id);
      return c.json(result);
    },
  };
};
