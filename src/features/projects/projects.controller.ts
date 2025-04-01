import type { ProjectsService } from './projects.service';
import { projectsRoutes } from './projects.routes';
import type { AppRouteHandler } from '../../types/app_context';
import { EndpointError } from 'utils/errors/http-errors/';

export type ProjectsController = {
  getProjects: AppRouteHandler<typeof projectsRoutes.getProjects>;
  getProjectById: AppRouteHandler<typeof projectsRoutes.getProjectById>;
  createProject: AppRouteHandler<typeof projectsRoutes.createProject>;
  updateProject: AppRouteHandler<typeof projectsRoutes.updateProject>;
  deleteProject: AppRouteHandler<typeof projectsRoutes.deleteProject>;
  getProjectTasks: AppRouteHandler<typeof projectsRoutes.getProjectTasks>;
};

export const createProjectsController = (
  projectsService: ProjectsService,
): ProjectsController => {
  return {
    getProjects: async (c) => {
      const projectsFound = await projectsService.getProjects();
      if (projectsFound.length === 0) {
        throw new EndpointError<typeof projectsRoutes.getProjects>(
          'NOT_FOUND',
          {
            message: 'No projects found',
          },
        );
      }
      return c.json(
        {
          success: true,
          data: projectsFound,
          message: 'Projects fetched',
        },
        200,
      );
    },

    getProjectById: async (c) => {
      const { projectId } = c.req.valid('param');
      const projectFound = await projectsService.getProjectById(projectId);

      if (!projectFound) {
        throw new EndpointError<typeof projectsRoutes.getProjectById>(
          'NOT_FOUND',
          {
            message: 'Project not found',
          },
        );
      }
      return c.json(
        { success: true, data: projectFound, message: 'Project fetched' },
        200,
      );
    },

    createProject: async (c) => {
      const project = c.req.valid('json');
      const createdProject = await projectsService.createProject(project);
      return c.json(
        { success: true, data: createdProject, message: 'Project created' },
        201,
      );
    },

    updateProject: async (c) => {
      const { projectId } = c.req.valid('param');
      const project = c.req.valid('json');
      const updatedProject = await projectsService.updateProject(
        projectId,
        project,
      );
      if (!updatedProject) {
        throw new EndpointError<typeof projectsRoutes.updateProject>(
          'NOT_FOUND',
          {
            message: 'Project not found',
          },
        );
      }
      return c.json(
        { success: true, data: updatedProject, message: 'Project updated' },
        200,
      );
    },

    deleteProject: async (c) => {
      const { projectId } = c.req.valid('param');
      const deleted = await projectsService.deleteProject(projectId);
      if (!deleted) {
        throw new EndpointError<typeof projectsRoutes.deleteProject>(
          'NOT_FOUND',
          {
            message: 'Project not found',
          },
        );
      }
      return c.json({ success: true, message: 'Project deleted' }, 200);
    },

    getProjectTasks: async (c) => {
      const { projectId } = c.req.valid('param');
      const tasksFound = await projectsService.getProjectTasks(projectId);
      if (tasksFound.length === 0) {
        throw new EndpointError<typeof projectsRoutes.getProjectTasks>(
          'NOT_FOUND',
          {
            message: 'No tasks found for this project',
          },
        );
      }
      return c.json(
        { success: true, data: tasksFound, message: 'Tasks fetched' },
        200,
      );
    },
  };
};
