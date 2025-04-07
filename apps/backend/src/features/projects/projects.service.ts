import type { ProjectsRepository } from './projects.repository';
import type { InsertProject, Project, UpdateProject } from './projects.db';
import type { Task } from '../tasks/tasks.db';

export type ProjectsService = {
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

export const createProjectsService = (
  projectsRepository: ProjectsRepository,
): ProjectsService => {
  return {
    getProjects: async (userId) => {
      return await projectsRepository.getProjects(userId);
    },

    getProjectById: async (userId, projectId) => {
      return await projectsRepository.getProjectById(userId, projectId);
    },

    createProject: async (userId, project) => {
      return await projectsRepository.createProject(userId, project);
    },

    updateProject: async (userId, projectId, project) => {
      return await projectsRepository.updateProject(userId, projectId, project);
    },

    deleteProject: async (userId, projectId) => {
      return await projectsRepository.deleteProject(userId, projectId);
    },

    getProjectTasks: async (userId, projectId) => {
      return await projectsRepository.getProjectTasks(userId, projectId);
    },
  };
};
