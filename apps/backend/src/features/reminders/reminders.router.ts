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
  .openapi(remindersRoutes.getReminders, remindersController.getReminders)
  .openapi(remindersRoutes.getReminderById, remindersController.getReminderById)
  .openapi(
    remindersRoutes.getRemindersByTaskId,
    remindersController.getRemindersByTaskId,
  )
  .openapi(remindersRoutes.createReminder, remindersController.createReminder)
  .openapi(remindersRoutes.updateReminder, remindersController.updateReminder)
  .openapi(remindersRoutes.deleteReminder, remindersController.deleteReminder);

export default remindersRouter;
