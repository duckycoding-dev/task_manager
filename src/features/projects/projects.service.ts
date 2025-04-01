import type { ProjectsRepository } from './projects.repository';
import type { InsertProject, Project, UpdateProject } from './projects.db';
import type { Task } from '../tasks/tasks.db';

export type ProjectsService = {
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

export const createProjectsService = (
  projectsRepository: ProjectsRepository,
): ProjectsService => {
  return {
    getProjects: async () => {
      return await projectsRepository.getProjects();
    },

    getProjectById: async (id) => {
      return await projectsRepository.getProjectById(id);
    },

    createProject: async (project) => {
      return await projectsRepository.createProject(project);
    },

    updateProject: async (id, project) => {
      return await projectsRepository.updateProject(id, project);
    },

    deleteProject: async (id) => {
      return await projectsRepository.deleteProject(id);
    },

    getProjectTasks: async (projectId) => {
      return await projectsRepository.getProjectTasks(projectId);
    },
  };
};
