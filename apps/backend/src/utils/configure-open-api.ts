import type { AppOpenAPI } from '../types/app_context';
import packageJSON from '../../package.json';
import { apiReference } from '@scalar/hono-api-reference';

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/docs', {
    openapi: '3.0.0',
    info: {
      title: 'Hono API',
      description: 'Hono API Documentation',
      version: packageJSON.version,
    },
  });

  app.get(
    '/reference',
    apiReference({
      pageTitle: 'Task Manager API Reference',
      theme: 'kepler',
      layout: 'classic',
      url: '/docs',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
    }),
  );
}
