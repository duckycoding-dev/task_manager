import { AppError } from '../../utils/errors';
import type { RemindersRepository } from './reminders.repository';
import type { Reminders } from './reminders.db';

export type RemindersService = {
  get: (id: string) => Promise<Reminders>;
  // ... other methods
};

export const createRemindersService = (
  remindersRepository: RemindersRepository,
): RemindersService => {
  return {
    get: async (id) => {
      const data = await remindersRepository.get(id);
      if (!data) {
        throw new AppError('NOT_FOUND', {
          message: 'not found',
        });
      }
      return data;
    },
  };
};
