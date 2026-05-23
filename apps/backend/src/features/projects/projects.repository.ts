import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { formatZodError } from 'utils/mapping/';

import type { Task } from '../tasks/tasks.db';
import { selectTaskSchema, tasks } from '../tasks/tasks.db';

import {
  type InsertProject,
  type Project,
  projects,
  selectProjectSchema,
  type UpdateProject,
  usersProjects,
} from './projects.db';

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
      throw new RepositoryValidationError(projectsList, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
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
      throw new RepositoryValidationError(project[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },

    createProject: async (userId, newProject) => {
      const createdProject = await db
        .insert(projects)
        .values({ ...newProject, userId })
        .returning();
      const parsed = selectProjectSchema.safeParse(createdProject[0]);
      if (parsed.success) {
        await db
          .insert(usersProjects)
          .values({ userId, projectId: parsed.data.id });
        return parsed.data;
      }
      throw new RepositoryValidationError(
        createdProject[0],
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
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
        updatedProject[0],
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
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
      await db
        .delete(usersProjects)
        .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
        .returning();
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
      throw new RepositoryValidationError(projectTasks, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
  };
};
