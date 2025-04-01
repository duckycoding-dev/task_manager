import { createProjectsController } from './projects.controller';
import { createProjectsService } from './projects.service';
import { createProjectsRepository } from './projects.repository';
import { createRouter } from '../../utils/create-app';

import { projectsRoutes } from './projects.routes';
import { db } from '../../db';
// Setup dependencies
const projectsRepo = createProjectsRepository(db);
const projectsService = createProjectsService(projectsRepo);
const projectsController = createProjectsController(projectsService);

// Create a typed router
const projectsRouter = createRouter()
  .basePath('/projects')
  .openapi(projectsRoutes.getProjects, projectsController.getProjects)
  .openapi(projectsRoutes.getProjectById, projectsController.getProjectById)
  .openapi(projectsRoutes.createProject, projectsController.createProject)
  .openapi(projectsRoutes.updateProject, projectsController.updateProject)
  .openapi(projectsRoutes.deleteProject, projectsController.deleteProject)
  .openapi(projectsRoutes.getProjectTasks, projectsController.getProjectTasks);

export default projectsRouter;
