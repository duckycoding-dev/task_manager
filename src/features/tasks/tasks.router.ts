import { createTasksController } from './tasks.controller';
import { createTasksService } from './tasks.service';
import { createTasksRepository } from './tasks.repository';
import { createRouter } from '../../utils/create-app';

import { tasksRoutes } from './tasks.routes';
import { db } from '../../db';
// Setup dependencies
const tasksRepo = createTasksRepository(db);
const tasksService = createTasksService(tasksRepo);
const tasksController = createTasksController(tasksService);

// Create a typed router
const tasksRouter = createRouter()
  .basePath('/tasks')
  .openapi(tasksRoutes.getTasks, tasksController.getTasks)
  .openapi(tasksRoutes.createTask, tasksController.createTask)
  .openapi(tasksRoutes.deleteTask, tasksController.deleteTask)
  .openapi(tasksRoutes.getTaskById, tasksController.getTaskById)
  .openapi(tasksRoutes.updateTask, tasksController.updateTask)
  .openapi(tasksRoutes.updateTaskPriority, tasksController.updateTaskPriority)
  .openapi(tasksRoutes.updateTaskRecurring, tasksController.updateTaskRecurring)
  .openapi(tasksRoutes.updateTaskStatus, tasksController.updateTaskStatus);

export default tasksRouter;
