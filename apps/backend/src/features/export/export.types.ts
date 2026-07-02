import { z } from 'zod/v4';

import { selectTaskLabelsSchema } from '../labels/labels.db';
import { labelWithTaskCountSchema } from '../labels/labels.types';
import { selectProjectSchema } from '../projects/projects.db';
import { selectReminderSchema } from '../reminders/reminders.db';
import { selectTaskSchema } from '../tasks/tasks.db';

// 📌 Response Schemas
// JSON bundle of the authenticated user's data. Shape per
// docs/stable/_shared/design/backend-changes-summary.md §"GET /export/tasks".
export const tasksExportSchema = z.object({
  exportedAt: z.coerce.date(),
  version: z.literal(1),
  tasks: selectTaskSchema.array(),
  reminders: selectReminderSchema.array(),
  projects: selectProjectSchema.array(),
  labels: labelWithTaskCountSchema.array(),
  taskLabels: selectTaskLabelsSchema.array(),
});

// Preferences are localStorage-backed in v1 — the server has no store, so
// the export carries an empty blob; the FE overlays its local data. A real
// server-side store lands with the v1.5 `users/preferences` work.
export const preferencesExportSchema = z.object({
  exportedAt: z.coerce.date(),
  version: z.literal(1),
  preferences: z.record(z.string(), z.unknown()),
});

// 📌 Types
export type TasksExport = z.infer<typeof tasksExportSchema>;
export type PreferencesExport = z.infer<typeof preferencesExportSchema>;
