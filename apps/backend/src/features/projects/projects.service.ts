import { EntityNotFoundError } from 'utils/errors/domain-errors/';

import type { Task } from '../tasks/tasks.db';

import type { InsertProject, Project, UpdateProject } from './projects.db';
import type { ProjectsRepository } from './projects.repository';

export type ProjectsService = {
  getProjects: (userId: string) => Promise<Project[]>;
  getProjectById: (userId: string, projectId: string) => Promise<Project>;
  createProject: (
    userId: string,
    newProject: InsertProject,
  ) => Promise<Project>;
  updateProject: (
    userId: string,
    projectId: string,
    project: UpdateProject,
  ) => Promise<Project>;
  deleteProject: (userId: string, projectId: string) => Promise<void>;
  getProjectTasks: (userId: string, projectId: string) => Promise<Task[]>;
};

export const createProjectsService = (
  projectsRepository: ProjectsRepository,
): ProjectsService => {
  return {
    getProjects: async (userId) => {
      return await projectsRepository.getProjects(userId);
    },

    getProjectById: async (userId, projectId) => {
      const project = await projectsRepository.getProjectById(
        userId,
        projectId,
      );
      if (!project) throw new EntityNotFoundError('Project', projectId);
      return project;
    },

    createProject: async (userId, project) => {
      return await projectsRepository.createProject(userId, project);
    },

    updateProject: async (userId, projectId, project) => {
      const updated = await projectsRepository.updateProject(
        userId,
        projectId,
        project,
      );
      if (!updated) throw new EntityNotFoundError('Project', projectId);
      return updated;
    },

    deleteProject: async (userId, projectId) => {
      const deleted = await projectsRepository.deleteProject(userId, projectId);
      if (!deleted) throw new EntityNotFoundError('Project', projectId);
    },

    getProjectTasks: async (userId, projectId) => {
      return await projectsRepository.getProjectTasks(userId, projectId);
    },
  };
};
