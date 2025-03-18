import tasksRouter from './features/tasks/tasks.router';
import type { AppOpenAPI } from './types/app_context';
import { createApp } from './utils/create-app';

export const app = createApp();

const routers = [tasksRouter] as const satisfies AppOpenAPI[];

routers.forEach((router) => {
  app.route('/', router);
});

export type AppType = (typeof routers)[number];
