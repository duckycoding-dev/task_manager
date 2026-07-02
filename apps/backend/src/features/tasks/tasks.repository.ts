import {
  and,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  sql,
} from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { formatZodError } from 'utils/mapping/';

import { taskLabels } from '../labels/labels.db';
import type { Reminder } from '../reminders';
import {
  remindersModel,
  selectReminderSchema,
} from '../reminders/reminders.db';

import {
  type InsertTask,
  selectTaskSchema,
  type Task,
  tasks as tasksModel,
  type UpdateTask,
} from './tasks.db';
import type {
  GetTasksQuery,
  TaskPriorityOption,
  TaskRecurringOption,
  TaskStatusOption,
} from './tasks.types';

export type TasksRepository = {
  getTasks: (userId: string, filters: GetTasksQuery) => Promise<Task[]>;
  getTaskById: (
    userId: string,
    id: string,
    opts?: { includeDeleted?: boolean },
  ) => Promise<Task | undefined>;
  restoreTask: (userId: string, id: string) => Promise<Task | undefined>;
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
  updateTaskStatus: (
    userId: string,
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task | undefined>;
  getTaskReminders: (userId: string, taskId: string) => Promise<Reminder[]>;
};

export const createTasksRepository = (
  db: PostgresJsDatabase,
): TasksRepository => {
  // Per ADR-0002, soft-deleted rows are filtered out by default on every
  // single-row lookup + write target; only `getTasks` opts callers in via
  // `filters.includeDeleted`.
  const activeTaskWhere = (userId: string, id: string) =>
    and(
      eq(tasksModel.userId, userId),
      eq(tasksModel.id, id),
      isNull(tasksModel.deletedAt),
    );

  return {
    getTasks: async (userId, filters) => {
      const {
        dueDate,
        dueDateGte,
        dueDateLte,
        labelId,
        priority,
        projectId,
        q,
        status,
        includeDeleted,
      } = filters;

      const conditions = [eq(tasksModel.userId, userId)];
      // Multi-value filters: OR within a field (inArray), AND across fields.
      if (projectId?.length)
        conditions.push(inArray(tasksModel.projectId, projectId));
      if (status?.length) conditions.push(inArray(tasksModel.status, status));
      if (priority?.length)
        conditions.push(inArray(tasksModel.priority, priority));
      if (dueDate) conditions.push(eq(tasksModel.dueDate, dueDate));
      if (dueDateGte) conditions.push(gte(tasksModel.dueDate, dueDateGte));
      if (dueDateLte) conditions.push(lte(tasksModel.dueDate, dueDateLte));
      if (q) {
        // Escape LIKE wildcards so user input matches literally.
        const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);
        conditions.push(ilike(tasksModel.title, `%${escaped}%`));
      }
      if (labelId?.length) {
        // Task matches when tagged with ANY of the given labels.
        conditions.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(taskLabels)
              .where(
                and(
                  eq(taskLabels.taskId, tasksModel.id),
                  inArray(taskLabels.labelId, labelId),
                ),
              ),
          ),
        );
      }
      if (!includeDeleted) conditions.push(isNull(tasksModel.deletedAt));

      const tasks = await db
        .select()
        .from(tasksModel)
        .where(and(...conditions));

      const parsed = selectTaskSchema.array().safeParse(tasks);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(tasks, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    getTaskById: async (userId, id, opts) => {
      const conditions = [eq(tasksModel.userId, userId), eq(tasksModel.id, id)];
      if (!opts?.includeDeleted) conditions.push(isNull(tasksModel.deletedAt));
      const task = await db
        .select()
        .from(tasksModel)
        .where(and(...conditions))
        .limit(1);

      if (task.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(task[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(task[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    restoreTask: async (userId, id) => {
      // Nulls `deletedAt`. Intentionally no `deletedAt IS NOT NULL` guard —
      // restoring a live row is an idempotent success (end state achieved),
      // which also makes double-click races from the deleted-items view
      // harmless. 0 rows = the task doesn't exist at all.
      const restored = await db
        .update(tasksModel)
        .set({ deletedAt: null })
        .where(and(eq(tasksModel.userId, userId), eq(tasksModel.id, id)))
        .returning();
      if (restored.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(restored[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(restored[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
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
      throw new RepositoryValidationError(createdTask[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },

    updateTask: async (userId, id, task) => {
      const updatedTask = await db
        .update(tasksModel)
        .set(task)
        .where(activeTaskWhere(userId, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(updatedTask[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },

    deleteTask: async (userId, id) => {
      // Soft delete: stamp `deleted_at`. Per ADR-0002.
      const updated = await db
        .update(tasksModel)
        .set({ deletedAt: new Date() })
        .where(activeTaskWhere(userId, id))
        .returning({ id: tasksModel.id });
      return updated.length > 0;
    },

    updateTaskPriority: async (userId, id, priority) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ priority })
        .where(activeTaskWhere(userId, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(updatedTask[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },

    updateTaskRecurringInterval: async (userId, id, recurringInterval) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ recurringInterval: recurringInterval })
        .where(activeTaskWhere(userId, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(updatedTask[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },

    updateTaskStatus: async (userId, id, status) => {
      const updatedTask = await db
        .update(tasksModel)
        .set({ status })
        .where(activeTaskWhere(userId, id))
        .returning();

      if (updatedTask.length === 0) {
        return undefined;
      }
      const parsed = selectTaskSchema.safeParse(updatedTask[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(updatedTask[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    getTaskReminders: async (userId, taskId) => {
      // Filter out soft-deleted reminders AND soft-deleted parent tasks.
      const taskReminders = await db
        .select()
        .from(remindersModel)
        .leftJoin(tasksModel, eq(tasksModel.id, remindersModel.taskId))
        .where(
          and(
            eq(tasksModel.userId, userId),
            eq(tasksModel.id, taskId),
            isNull(tasksModel.deletedAt),
            isNull(remindersModel.deletedAt),
          ),
        );

      const reminders = taskReminders.map(({ reminders }) => reminders);

      const parsed = selectReminderSchema.array().safeParse(reminders);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(reminders, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
  };
};
