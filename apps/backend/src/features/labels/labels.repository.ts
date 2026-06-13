import { and, eq, isNull } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { RepositoryValidationError } from 'utils/errors/domain-errors/';
import { formatZodError } from 'utils/mapping/';

import {
  type InsertLabel,
  type Label,
  labels,
  selectLabelSchema,
  taskLabels,
  type UpdateLabel,
} from './labels.db';
import type { GetLabelsQuery } from './labels.types';

export type LabelsRepository = {
  getLabels: (userId: string, filters: GetLabelsQuery) => Promise<Label[]>;
  getLabelById: (userId: string, labelId: string) => Promise<Label | undefined>;
  createLabel: (userId: string, newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (
    userId: string,
    labelId: string,
    data: UpdateLabel,
  ) => Promise<Label | undefined>;
  deleteLabel: (userId: string, labelId: string) => Promise<boolean>;
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
    getLabelById: async (userId, labelId) => {
      const res = await db
        .select()
        .from(labels)
        .where(
          and(
            eq(labels.userId, userId),
            eq(labels.id, labelId),
            isNull(labels.deletedAt),
          ),
        );
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

      const labelsFound = await db
        .select()
        .from(labels)
        .where(and(...conditions));

      const parsed = selectLabelSchema.array().safeParse(labelsFound);
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
        .values({ ...newLabel, userId })
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
    deleteLabel: async (userId, labelId) => {
      // Soft delete: stamp `deleted_at`. Per ADR-0002, hard-delete is a
      // separate permanent-delete endpoint exposed only from the deleted-items
      // view (not in v1).
      const updated = await db
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
      return updated.length > 0;
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
