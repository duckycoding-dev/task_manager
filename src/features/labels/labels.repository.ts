import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import {
  type Label,
  selectLabelSchema,
  labels,
  type InsertLabel,
  type UpdateLabel,
  taskLabels,
} from './labels.db';
import { formatZodError } from 'utils/mapping/';
import type { GetLabelsQuery } from './labels.types';
import { RepositoryValidationError } from 'utils/errors/domain-errors/';

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
        .where(and(eq(labels.userId, userId), eq(labels.id, labelId)));
      if (res.length === 0) {
        return undefined;
      }

      const parsed = selectLabelSchema.safeParse(res[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    getLabels: async (userId, filters) => {
      const { name, color } = filters;
      const query = db.select().from(labels);
      query.where(eq(labels.userId, userId));

      if (name) {
        query.where(eq(labels.name, name));
      }
      if (color) {
        query.where(eq(labels.color, color));
      }
      if (userId) {
        query.where(eq(labels.userId, userId));
      }

      const labelsFound = await query;

      const parsed = selectLabelSchema.array().safeParse(labelsFound);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
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
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    updateLabel: async (userId, labelId, data) => {
      const updatedLabel = await db
        .update(labels)
        .set(data)
        .where(and(eq(labels.userId, userId), eq(labels.id, labelId)))
        .returning();
      if (updatedLabel.length === 0) {
        return undefined;
      }
      const parsed = selectLabelSchema.safeParse(updatedLabel[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    deleteLabel: async (userId, labelId) => {
      const deletedLabel = await db
        .delete(labels)
        .where(and(eq(labels.userId, userId), eq(labels.id, labelId)))
        .returning();
      if (deletedLabel.length === 0) {
        return false;
      }
      return true;
    },
    assignLabelToTask: async (userId, taskId, labelId) => {
      // First check if the label belongs to the user
      const userLabel = await db
        .select()
        .from(labels)
        .where(and(eq(labels.id, labelId), eq(labels.userId, userId)))
        .limit(1);

      if (userLabel.length === 0) {
        return false; // Label doesn't belong to this user
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
      // First check if the label belongs to the user
      const userLabel = await db
        .select()
        .from(labels)
        .where(and(eq(labels.id, labelId), eq(labels.userId, userId)))
        .limit(1);

      if (userLabel.length === 0) {
        return false; // Label doesn't belong to this user
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
