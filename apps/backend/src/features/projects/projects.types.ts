import {} from './projects.db';
import { z } from 'zod/v4';
import { extendZodWithOpenApi } from '@hono/zod-openapi';
extendZodWithOpenApi(z);

// 📌 Query Params Schemas
export const getProjectsQuerySchema = z.object({
  // Add relevant query params specific to projects
});

// 📌 Path Params Schemas
export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Project id should be a valid uuid'),
});

// 📌 Types
export type GetProjectsQuery = z.infer<typeof getProjectsQuerySchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
