import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
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
    userId: string,
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTaskById: (userId: string, id: string) => Promise<Task | undefined>;
  createTask: (userId: string, newTask: InsertTask) => Promise<Task>;
  updateTask: (
    userId: string,
    id: string,
    task: UpdateTask,
  ) => Promise<Task | undefined>;
  deleteTask: (userId: string, id: string) => Promise<boolean>;
  updateTaskPriority: (
    userId: string,
    id: string,
    priority: TaskPriorityOption,
  ) => Promise<Task | undefined>;
  updateTaskRecurringInterval: (
    userId: string,
    id: string,
    recurringInterval: TaskRecurringOption,
  ) => Promise<Task | undefined>;
  updateTaskIsRecurring: (
    userId: string,
    id: string,
    recurringInterval: boolean,
  ) => Promise<Task | undefined>;
  updateTaskStatus: (
    userId: string,
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task | undefined>;
};

export const createTasksRepository = (
  db: PostgresJsDatabase,
): TasksRepository => {
  return {
    getTasks: async (userId, filters) => {
      const { dueDate, priority, projectId, status } = filters;
      const query = db.select().from(tasksModel);
      query.where(eq(tasksModel.userId, userId));

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
    getTaskById: async (userId, id) => {
      const task = await db
        .select()
        .from(tasksModel)
        .where(and(eq(tasksModel.id, id), eq(tasksModel.userId, userId)))
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
    createTask: async (userId, newTask) => {
      const createdTask = await db
        .insert(tasksModel)
        .values({ ...newTask, userId })
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

    updateTask: async (userId, id, task) => {
      const updatedTask = await db
        .update(tasksModel)
        .set(task)
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
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

    deleteTask: async (userId, id) => {
      const deleted = await db
        .delete(tasksModel)
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
        .returning();

      if (deleted.length === 0) {
        return false;
      }
      return true;
    },

    updateTaskPriority: async (userId, id, priority) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ priority })
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
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

    updateTaskRecurringInterval: async (userId, id, recurringInterval) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ recurringInterval: recurringInterval })
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
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

    updateTaskIsRecurring: async (userId, id, isRecurring) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ isRecurring })
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
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

    updateTaskStatus: async (userId, id, status) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ status })
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
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
