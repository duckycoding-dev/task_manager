import type { LabelsRepository } from '../labels/labels.repository';
import type { ProjectsRepository } from '../projects/projects.repository';
import type { RemindersRepository } from '../reminders/reminders.repository';
import type { TasksRepository } from '../tasks/tasks.repository';

import type { PreferencesExport, TasksExport } from './export.types';

export type ExportService = {
  exportTasks: (
    userId: string,
    includeDeleted: boolean,
  ) => Promise<TasksExport>;
  exportPreferences: (userId: string) => Promise<PreferencesExport>;
};

// Cross-feature READS go through the repositories directly (no service
// detour) per coding-practices §"Cross-feature reads call the repo;
// cross-feature writes call the service".
export const createExportService = (
  tasksRepository: TasksRepository,
  remindersRepository: RemindersRepository,
  projectsRepository: ProjectsRepository,
  labelsRepository: LabelsRepository,
): ExportService => {
  return {
    exportTasks: async (userId, includeDeleted) => {
      const [tasks, reminders, projects, labels, taskLabels] =
        await Promise.all([
          tasksRepository.getTasks(userId, { includeDeleted }),
          remindersRepository.getReminders(userId, { includeDeleted }),
          projectsRepository.getProjects(userId),
          labelsRepository.getLabels(userId, { includeDeleted }),
          labelsRepository.getTaskLabels(userId),
        ]);
      return {
        exportedAt: new Date(),
        version: 1,
        tasks,
        reminders,
        projects,
        labels,
        taskLabels,
      };
    },
    exportPreferences: async () => {
      // v1: preferences live in the FE's localStorage — no server store to
      // read from. Empty blob keeps the endpoint contract stable until the
      // v1.5 server-side `users/preferences` work lands.
      return {
        exportedAt: new Date(),
        version: 1,
        preferences: {},
      };
    },
  };
};
