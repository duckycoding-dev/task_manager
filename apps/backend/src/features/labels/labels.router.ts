import { db } from '../../db';
import { createRouter } from '../../utils/create-app';

import { createLabelsController } from './labels.controller';
import { createLabelsRepository } from './labels.repository';
import { labelsRoutes } from './labels.routes';
import { createLabelsService } from './labels.service';
// Setup dependencies
const labelsRepo = createLabelsRepository(db);
const labelsService = createLabelsService(labelsRepo);
const labelsController = createLabelsController(labelsService);

// Create a typed router
export const labelsRouter = createRouter()
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
