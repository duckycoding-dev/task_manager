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
  .openapi(labelsRoutes.getLabels, labelsController.getLabels)
  .openapi(labelsRoutes.getLabelById, labelsController.getLabelById)
  .openapi(labelsRoutes.createLabel, labelsController.createLabel)
  .openapi(labelsRoutes.updateLabel, labelsController.updateLabel)
  .openapi(labelsRoutes.deleteLabel, labelsController.deleteLabel)
  .openapi(labelsRoutes.assignLabelToTask, labelsController.assignLabelToTask)
  .openapi(
    labelsRoutes.removeLabelFromTask,
    labelsController.removeLabelFromTask,
  );
export default labelsRouter;
