import { db } from '../../db';
import { createRouter } from '../../utils/create-app';

import { createProjectsController } from './projects.controller';
import { createProjectsRepository } from './projects.repository';
import { projectsRoutes } from './projects.routes';
import { createProjectsService } from './projects.service';
// Setup dependencies
const projectsRepo = createProjectsRepository(db);
const projectsService = createProjectsService(projectsRepo);
const projectsController = createProjectsController(projectsService);

// Create a typed router
export const projectsRouter = createRouter()
  .basePath('/projects')
  .openapi(projectsRoutes.getProjects, projectsController.getProjects)
  .openapi(projectsRoutes.getProjectById, projectsController.getProjectById)
  .openapi(projectsRoutes.createProject, projectsController.createProject)
  .openapi(projectsRoutes.updateProject, projectsController.updateProject)
  .openapi(projectsRoutes.deleteProject, projectsController.deleteProject)
  .openapi(projectsRoutes.getProjectTasks, projectsController.getProjectTasks);
