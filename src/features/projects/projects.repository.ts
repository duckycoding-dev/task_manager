import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import {
  type Project,
  selectProjectSchema,
  projects,
  type InsertProject,
  type UpdateProject,
} from './projects.db';
import { formatZodError } from 'utils/mapping/';
import type { Task } from '../tasks/tasks.db';
import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { selectTaskSchema, tasks } from '../tasks/tasks.db';

export type ProjectsRepository = {
  getProjects: (userId: string) => Promise<Project[]>;
  getProjectById: (
    userId: string,
    projectId: string,
  ) => Promise<Project | undefined>;
  createProject: (
    userId: string,
    newProject: InsertProject,
  ) => Promise<Project>;
  updateProject: (
    userId: string,
    projectId: string,
    project: UpdateProject,
  ) => Promise<Project | undefined>;
  deleteProject: (userId: string, projectId: string) => Promise<boolean>;
  getProjectTasks: (userId: string, projectId: string) => Promise<Task[]>;
};

export const createProjectsRepository = (
  db: PostgresJsDatabase,
): ProjectsRepository => {
  return {
    getProjects: async (userId) => {
      const projectsList = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId));

      const parsed = selectProjectSchema.array().safeParse(projectsList);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    getProjectById: async (userId, projectId) => {
      const project = await db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .limit(1);

      if (project.length === 0) {
        return undefined;
      }
      const parsed = selectProjectSchema.safeParse(project[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    createProject: async (userId, newProject) => {
      const createdProject = await db
        .insert(projects)
        .values({ ...newProject, userId })
        .returning();
      const parsed = selectProjectSchema.safeParse(createdProject[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    updateProject: async (userId, projectId, project) => {
      const updatedProject = await db
        .update(projects)
        .set(project)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .returning();

      if (updatedProject.length === 0) {
        return undefined;
      }
      const parsed = selectProjectSchema.safeParse(updatedProject[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    deleteProject: async (userId, projectId) => {
      const deleted = await db
        .delete(projects)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .returning();

      if (deleted.length === 0) {
        return false;
      }
      return true;
    },

    getProjectTasks: async (userId, projectId) => {
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(
          and(eq(projects.userId, userId), eq(tasks.projectId, projectId)),
        );

      const parsed = selectTaskSchema.array().safeParse(projectTasks);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
  };
};
