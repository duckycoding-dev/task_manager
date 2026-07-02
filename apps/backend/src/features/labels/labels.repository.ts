import { and, eq, getTableColumns, isNotNull, isNull, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { colorFromName } from 'utils/color/';
import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { formatZodError } from 'utils/mapping/';

import { tasks } from '../tasks/tasks.db';

import {
  type InsertLabel,
  type Label,
  labels,
  selectLabelSchema,
  selectTaskLabelsSchema,
  type TaskLabel,
  taskLabels,
  type UpdateLabel,
} from './labels.db';
import {
  type GetLabelsQuery,
  type LabelWithTaskCount,
  labelWithTaskCountSchema,
} from './labels.types';

export type LabelsRepository = {
  getLabels: (
    userId: string,
    filters: GetLabelsQuery,
  ) => Promise<LabelWithTaskCount[]>;
  getLabelById: (
    userId: string,
    labelId: string,
    opts?: { includeDeleted?: boolean },
  ) => Promise<Label | undefined>;
  createLabel: (userId: string, newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (
    userId: string,
    labelId: string,
    data: UpdateLabel,
  ) => Promise<Label | undefined>;
  restoreLabel: (userId: string, labelId: string) => Promise<Label | undefined>;
  deleteLabel: (
    userId: string,
    labelId: string,
    removeFromTasks: boolean,
  ) => Promise<boolean>;
  hardDeleteLabel: (userId: string, labelId: string) => Promise<boolean>;
  getTaskLabels: (userId: string) => Promise<TaskLabel[]>;
  assignLabelToTask: (
    userId: string,
    taskId: string,
    labelId: string,
  ) => Promise<boolean>;
  removeLabelFromTask: (
    userId: string,
    taskId: string,
    labelId: string,
  ) => Promise<boolean>;
};

export const createLabelsRepository = (
  db: PostgresJsDatabase,
): LabelsRepository => {
  return {
    getLabelById: async (userId, labelId, opts) => {
      const conditions = [eq(labels.userId, userId), eq(labels.id, labelId)];
      if (!opts?.includeDeleted) conditions.push(isNull(labels.deletedAt));
      const res = await db
        .select()
        .from(labels)
        .where(and(...conditions));
      if (res.length === 0) {
        return undefined;
      }

      const parsed = selectLabelSchema.safeParse(res[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(res[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    getLabels: async (userId, filters) => {
      const { name, color, includeDeleted } = filters;

      const conditions = [eq(labels.userId, userId)];
      if (name) conditions.push(eq(labels.name, name));
      if (color) conditions.push(eq(labels.color, color));
      if (!includeDeleted) conditions.push(isNull(labels.deletedAt));

      // `taskCount` counts LIVE tasks only: the join condition (not the
      // WHERE) carries `tasks.deletedAt IS NULL` so labels with zero live
      // tasks still return (count 0) instead of being dropped.
      const labelsFound = await db
        .select({
          ...getTableColumns(labels),
          taskCount: sql<number>`count(${tasks.id})::int`,
        })
        .from(labels)
        .leftJoin(taskLabels, eq(taskLabels.labelId, labels.id))
        .leftJoin(
          tasks,
          and(eq(tasks.id, taskLabels.taskId), isNull(tasks.deletedAt)),
        )
        .where(and(...conditions))
        .groupBy(labels.id);

      const parsed = labelWithTaskCountSchema.array().safeParse(labelsFound);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(labelsFound, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    createLabel: async (userId, newLabel) => {
      const createdLabel = await db
        .insert(labels)
        .values({
          ...newLabel,
          userId,
          color: newLabel.color ?? colorFromName(newLabel.name),
        })
        .returning();
      const parsed = selectLabelSchema.safeParse(createdLabel[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        createdLabel[0],
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
      );
    },
    updateLabel: async (userId, labelId, data) => {
      const updatedLabel = await db
        .update(labels)
        .set(data)
        .where(
          and(
            eq(labels.userId, userId),
            eq(labels.id, labelId),
            isNull(labels.deletedAt),
          ),
        )
        .returning();
      if (updatedLabel.length === 0) {
        return undefined;
      }
      const parsed = selectLabelSchema.safeParse(updatedLabel[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        updatedLabel[0],
        parsed.error.issues,
        {
          message: formatZodError(parsed.error),
          cause: parsed.error,
        },
      );
    },
    restoreLabel: async (userId, labelId) => {
      // Nulls `deletedAt`. No `deletedAt IS NOT NULL` guard — restoring a
      // live row is an idempotent success. 0 rows = label doesn't exist.
      const restored = await db
        .update(labels)
        .set({ deletedAt: null })
        .where(and(eq(labels.userId, userId), eq(labels.id, labelId)))
        .returning();
      if (restored.length === 0) {
        return undefined;
      }
      const parsed = selectLabelSchema.safeParse(restored[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(restored[0], parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    deleteLabel: async (userId, labelId, removeFromTasks) => {
      // Soft delete: stamp `deleted_at`. With `removeFromTasks`, also wipe
      // the `task_labels` join rows in the same transaction (mode 2 of
      // ADR-0007's two-mode delete).
      return await db.transaction(async (tx) => {
        const updated = await tx
          .update(labels)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(labels.userId, userId),
              eq(labels.id, labelId),
              isNull(labels.deletedAt),
            ),
          )
          .returning({ id: labels.id });
        if (updated.length === 0) {
          return false;
        }
        if (removeFromTasks) {
          await tx.delete(taskLabels).where(eq(taskLabels.labelId, labelId));
        }
        return true;
      });
    },
    hardDeleteLabel: async (userId, labelId) => {
      // Permanent delete (tier 3 of ADR-0007). Only soft-deleted rows are
      // eligible — the caller (service) validates and 409s otherwise; the
      // `isNotNull` guard here is defense-in-depth. FK `ON DELETE CASCADE`
      // cleans up any remaining `task_labels` rows.
      const deleted = await db
        .delete(labels)
        .where(
          and(
            eq(labels.userId, userId),
            eq(labels.id, labelId),
            isNotNull(labels.deletedAt),
          ),
        )
        .returning({ id: labels.id });
      return deleted.length > 0;
    },
    getTaskLabels: async (userId) => {
      // All M2M rows belonging to the user's labels (used by the export
      // bundle). Scoped via the labels join — task_labels itself carries
      // no userId column.
      const rows = await db
        .select({ taskId: taskLabels.taskId, labelId: taskLabels.labelId })
        .from(taskLabels)
        .innerJoin(labels, eq(labels.id, taskLabels.labelId))
        .where(eq(labels.userId, userId));

      const parsed = selectTaskLabelsSchema.array().safeParse(rows);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(rows, parsed.error.issues, {
        message: formatZodError(parsed.error),
        cause: parsed.error,
      });
    },
    assignLabelToTask: async (userId, taskId, labelId) => {
      // First check if the label belongs to the user (and isn't soft-deleted)
      const userLabel = await db
        .select()
        .from(labels)
        .where(
          and(
            eq(labels.id, labelId),
            eq(labels.userId, userId),
            isNull(labels.deletedAt),
          ),
        )
        .limit(1);

      if (userLabel.length === 0) {
        return false; // Label doesn't belong to this user (or is soft-deleted)
      }

      const assignedLabel = await db
        .insert(taskLabels)
        .values({ taskId, labelId })
        .returning();
      if (assignedLabel.length === 0) {
        return false;
      }
      return true;
    },
    removeLabelFromTask: async (userId, taskId, labelId) => {
      // First check if the label belongs to the user (and isn't soft-deleted)
      const userLabel = await db
        .select()
        .from(labels)
        .where(
          and(
            eq(labels.id, labelId),
            eq(labels.userId, userId),
            isNull(labels.deletedAt),
          ),
        )
        .limit(1);

      if (userLabel.length === 0) {
        return false; // Label doesn't belong to this user (or is soft-deleted)
      }
      const removedLabel = await db
        .delete(taskLabels)
        .where(
          and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)),
        )
        .returning();
      if (removedLabel.length === 0) {
        return false;
      }
      return true;
    },
  };
};
