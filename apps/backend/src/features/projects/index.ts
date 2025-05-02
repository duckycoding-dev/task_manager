// this file contains everything related to projects that can be used in the other packages

export type {
  InsertProject,
  Project,
  UpdateProject,
  UserProject,
  InsertUserProject,
} from './projects.db';

export {
  insertProjectSchema,
  selectProjectSchema,
  updateProjectSchema,
  insertUserProjectSchema,
  selectUserProjectSchema,
} from './projects.db';
