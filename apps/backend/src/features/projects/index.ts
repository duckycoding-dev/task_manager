// this file contains everything related to projects that can be used in the other packages

export type {
  InsertProject,
  InsertUserProject,
  Project,
  UpdateProject,
  UserProject,
} from './projects.db';
export {
  insertProjectSchema,
  insertUserProjectSchema,
  selectProjectSchema,
  selectUserProjectSchema,
  updateProjectSchema,
} from './projects.db';
