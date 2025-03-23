import { createRemindersController } from './reminders.controller';
import { createRemindersService } from './reminders.service';
import { createRemindersRepository } from './reminders.repository';
import { createRouter } from '../../utils/create-app';

import { remindersRoutes } from './reminders.routes';
import { db } from '../../db';
// Setup dependencies
const remindersRepo = createRemindersRepository(db);
const remindersService = createRemindersService(remindersRepo);
const remindersController = createRemindersController(remindersService);

// Create a typed router
const remindersRouter = createRouter()
  .basePath('/reminders')
  .openapi(remindersRoutes.get, remindersController.get);

export default remindersRouter;
