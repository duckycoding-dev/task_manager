import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import {
  type InsertTask,
  type Task,
  type UpdateTask,
  selectTaskSchema,
  tasks as tasksModel,
} from './tasks.db';
import { formatZodError } from 'utils/mapping/';
import type {
  GetTasksQuery,
  TaskPriorityOption,
  TaskRecurringOption,
  TaskStatusOption,
} from './tasks.types';
import { RepositoryValidationError } from 'utils/errors/domain-errors/';

export type TasksRepository = {
  getTasks: (
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTaskById: (id: string) => Promise<Task | undefined>;
  createTask: (newTask: InsertTask) => Promise<Task>;
  updateTask: (id: string, task: UpdateTask) => Promise<Task | undefined>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskPriority: (
    id: string,
    priority: TaskPriorityOption,
  ) => Promise<Task | undefined>;
  updateTaskRecurringInterval: (
    id: string,
    recurringInterval: TaskRecurringOption,
  ) => Promise<Task | undefined>;
  updateTaskIsRecurring: (
    id: string,
    recurringInterval: boolean,
  ) => Promise<Task | undefined>;
  updateTaskStatus: (
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task | undefined>;
};

export const createTasksRepository = (
  db: PostgresJsDatabase,
): TasksRepository => {
  return {
    getTasks: async (filters) => {
      const { dueDate, priority, projectId, status } = filters;
      const query = db.select().from(tasksModel);

      if (projectId) {
        query.where(eq(tasksModel.projectId, projectId));
      }
      if (dueDate) {
        query.where(eq(tasksModel.dueDate, dueDate));
      }
      if (priority) {
        query.where(eq(tasksModel.priority, priority));
      }
      if (status) {
        query.where(eq(tasksModel.status, status));
      }

      const tasks = await query;

      const parsed = selectTaskSchema.array().safeParse(tasks);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    getTaskById: async (id) => {
      const task = await db
        .select()
        .from(tasksModel)
        .where(eq(tasksModel.id, id))
        .limit(1);

      if (task.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(task[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    createTask: async (newTask) => {
      const createdTask = await db
        .insert(tasksModel)
        .values(newTask)
        .returning();
      const parsed = selectTaskSchema.safeParse(createdTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    updateTask: async (id, task) => {
      const updatedTask = await db
        .update(tasksModel)
        .set(task)
        .where(eq(tasksModel.id, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    deleteTask: async (id) => {
      const deleted = await db
        .delete(tasksModel)
        .where(eq(tasksModel.id, id))
        .returning();

      if (deleted.length === 0) {
        return false;
      }
      return true;
    },

    updateTaskPriority: async (id, priority) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ priority })
        .where(eq(tasksModel.id, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    updateTaskRecurringInterval: async (id, recurringInterval) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ recurringInterval: recurringInterval })
        .where(eq(tasksModel.id, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    updateTaskIsRecurring: async (id, isRecurring) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ isRecurring })
        .where(eq(tasksModel.id, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },

    updateTaskStatus: async (id, status) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ status })
        .where(eq(tasksModel.id, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
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
