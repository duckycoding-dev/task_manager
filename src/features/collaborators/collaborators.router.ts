import { createCollaboratorsController } from './collaborators.controller';
import { createCollaboratorsService } from './collaborators.service';
import { createCollaboratorsRepository } from './collaborators.repository';
import { createRouter } from '../../utils/create-app';

import { collaboratorsRoutes } from './collaborators.routes';
import { db } from '../../db';
// Setup dependencies
const collaboratorsRepo = createCollaboratorsRepository(db);
const collaboratorsService = createCollaboratorsService(collaboratorsRepo);
const collaboratorsController =
  createCollaboratorsController(collaboratorsService);

// Create a typed router
const collaboratorsRouter = createRouter()
  .basePath('/collaborators')
  .openapi(collaboratorsRoutes.get, collaboratorsController.get);

export default collaboratorsRouter;
