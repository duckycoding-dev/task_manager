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
  getLabels: (filters: GetLabelsQuery) => Promise<Label[]>;
  getLabelById: (id: string) => Promise<Label | undefined>;
  createLabel: (newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (id: string, data: UpdateLabel) => Promise<Label | undefined>;
  deleteLabel: (id: string) => Promise<boolean>;
  assignLabelToTask: (taskId: string, labelId: string) => Promise<boolean>;
  removeLabelFromTask: (taskId: string, labelId: string) => Promise<boolean>;
};

export const createLabelsRepository = (
  db: PostgresJsDatabase,
): LabelsRepository => {
  return {
    getLabelById: async (id) => {
      const res = await db.select().from(labels).where(eq(labels.id, id));
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
    getLabels: async (filters) => {
      const { name, userId, color } = filters;
      const query = db.select().from(labels);

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
    createLabel: async (newLabel) => {
      const createdLabel = await db.insert(labels).values(newLabel).returning();
      const parsed = selectLabelSchema.safeParse(createdLabel[0]);
      if (parsed.success) {
        return parsed.data;
      }
      throw new RepositoryValidationError(
        formatZodError(parsed.error),
        parsed.data,
      );
    },
    updateLabel: async (id, data) => {
      const updatedLabel = await db
        .update(labels)
        .set(data)
        .where(eq(labels.id, id))
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
    deleteLabel: async (id) => {
      const deletedLabel = await db
        .delete(labels)
        .where(eq(labels.id, id))
        .returning();
      if (deletedLabel.length === 0) {
        return false;
      }
      return true;
    },
    assignLabelToTask: async (taskId, labelId) => {
      const assignedLabel = await db
        .insert(taskLabels)
        .values({ taskId, labelId })
        .returning();
      if (assignedLabel.length === 0) {
        return false;
      }
      return true;
    },
    removeLabelFromTask: async (taskId, labelId) => {
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
