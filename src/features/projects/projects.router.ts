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
  .openapi(projectsRoutes.get, projectsController.get);

export default projectsRouter;
