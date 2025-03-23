import { createLabelsController } from './labels.controller';
import { createLabelsService } from './labels.service';
import { createLabelsRepository } from './labels.repository';
import { createRouter } from '../../utils/create-app';

import { labelsRoutes } from './labels.routes';
import { db } from '../../db';
// Setup dependencies
const labelsRepo = createLabelsRepository(db);
const labelsService = createLabelsService(labelsRepo);
const labelsController = createLabelsController(labelsService);

// Create a typed router
const labelsRouter = createRouter()
  .basePath('/labels')
  .openapi(labelsRoutes.get, labelsController.get);

export default labelsRouter;
