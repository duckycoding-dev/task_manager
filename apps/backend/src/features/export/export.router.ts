import { db } from '../../db';
import { createRouter } from '../../utils/create-app';
import { createLabelsRepository } from '../labels/labels.repository';
import { createProjectsRepository } from '../projects/projects.repository';
import { createRemindersRepository } from '../reminders/reminders.repository';
import { createTasksRepository } from '../tasks/tasks.repository';

import { createExportController } from './export.controller';
import { exportRoutes } from './export.routes';
import { createExportService } from './export.service';

// Setup dependencies — the export service composes cross-feature repo reads
// (no repository of its own; it owns no tables).
const exportService = createExportService(
  createTasksRepository(db),
  createRemindersRepository(db),
  createProjectsRepository(db),
  createLabelsRepository(db),
);
const exportController = createExportController(exportService);

// Create a typed router
export const exportRouter = createRouter()
  .basePath('/export')
  .openapi(exportRoutes.exportTasks, exportController.exportTasks)
  .openapi(exportRoutes.exportPreferences, exportController.exportPreferences);
