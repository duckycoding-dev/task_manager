// this file contains everything related to tasks that can be used in the other packages

export type { InsertTask, Task, UpdateTask } from './tasks.db';

export {
  insertTaskSchema,
  selectTaskSchema,
  updateTaskSchema,
  statusOptions,
  priorityOptions,
  recurringOptions,
} from './tasks.db';
