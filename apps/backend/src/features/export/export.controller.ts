import { AUTH_CTX_KEYS } from 'utils/auth-context/';

import type { AppRouteHandler } from '../../types/app_context';

import { type exportRoutes } from './export.routes';
import type { ExportService } from './export.service';

export type ExportController = {
  exportTasks: AppRouteHandler<typeof exportRoutes.exportTasks>;
  exportPreferences: AppRouteHandler<typeof exportRoutes.exportPreferences>;
};

export const createExportController = (
  exportService: ExportService,
): ExportController => {
  return {
    exportTasks: async (c) => {
      const { includeDeleted } = c.req.valid('query');
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const bundle = await exportService.exportTasks(userId, includeDeleted);
      return c.json(
        { success: true, data: bundle, message: 'Tasks exported' },
        200,
      );
    },
    exportPreferences: async (c) => {
      const { id: userId } = c.get(AUTH_CTX_KEYS.user);
      const bundle = await exportService.exportPreferences(userId);
      return c.json(
        { success: true, data: bundle, message: 'Preferences exported' },
        200,
      );
    },
  };
};
