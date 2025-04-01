import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
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
  getProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project | undefined>;
  createProject: (newProject: InsertProject) => Promise<Project>;
  updateProject: (
    id: string,
    project: UpdateProject,
  ) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<boolean>;
  getProjectTasks: (projectId: string) => Promise<Task[]>;
};

export const createProjectsRepository = (
  db: PostgresJsDatabase,
): ProjectsRepository => {
  return {
    getProjects: async () => {
      const projectsList = await db.select().from(projects);

      const parsed = selectProjectSchema.array().safeParse(projectsList);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    getProjectById: async (id) => {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
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

    createProject: async (newProject) => {
      const createdProject = await db
        .insert(projects)
        .values(newProject)
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

    updateProject: async (id, project) => {
      const updatedProject = await db
        .update(projects)
        .set(project)
        .where(eq(projects.id, id))
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

    deleteProject: async (id) => {
      const deleted = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();

      if (deleted.length === 0) {
        return false;
      }
      return true;
    },

    getProjectTasks: async (projectId) => {
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId));

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
