import labelsRouter from './features/labels/labels.router';
import projectsRouter from './features/projects/projects.router';
import remindersRouter from './features/reminders/reminders.router';
import tasksRouter from './features/tasks/tasks.router';
import type { AppOpenAPI } from './types/app_context';
import { createApp } from './utils/create-app';

export const app = createApp();

const routers = [
  tasksRouter,
  labelsRouter,
  remindersRouter,
  projectsRouter,
] as const satisfies AppOpenAPI[];

routers.forEach((router) => {
  app.route('/', router);
});

export type AppType = (typeof routers)[number];
