import { db } from '../../db';
import { createRouter } from '../../utils/create-app';

import { createTasksController } from './tasks.controller';
import { createTasksRepository } from './tasks.repository';
import { tasksRoutes } from './tasks.routes';
import { createTasksService } from './tasks.service';
// Setup dependencies
const tasksRepo = createTasksRepository(db);
const tasksService = createTasksService(tasksRepo);
const tasksController = createTasksController(tasksService);

// Create a typed router
export const tasksRouter = createRouter()
  .basePath('/tasks')
  .openapi(tasksRoutes.getTasks, tasksController.getTasks)
  .openapi(tasksRoutes.createTask, tasksController.createTask)
  .openapi(tasksRoutes.deleteTask, tasksController.deleteTask)
  .openapi(tasksRoutes.getTaskById, tasksController.getTaskById)
  .openapi(tasksRoutes.updateTask, tasksController.updateTask)
  .openapi(tasksRoutes.updateTaskPriority, tasksController.updateTaskPriority)
  .openapi(
    tasksRoutes.updateTaskRecurringInterval,
    tasksController.updateTaskRecurringInterval,
  )
  .openapi(
    tasksRoutes.updateTaskIsRecurring,
    tasksController.updateTaskIsRecurring,
  )
  .openapi(tasksRoutes.updateTaskStatus, tasksController.updateTaskStatus)
  .openapi(tasksRoutes.getTaskReminders, tasksController.getTaskReminders);
