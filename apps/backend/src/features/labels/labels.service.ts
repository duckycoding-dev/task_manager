import {
  ConflictError,
  EntityNotFoundError,
  ValidationError,
} from 'utils/errors/domain-errors/';

import type { InsertLabel, Label, UpdateLabel } from './labels.db';
import type { LabelsRepository } from './labels.repository';
import type {
  DeleteLabelQuery,
  GetLabelsQuery,
  LabelWithTaskCount,
} from './labels.types';

export type LabelsService = {
  getLabels: (
    userId: string,
    filters: GetLabelsQuery,
  ) => Promise<LabelWithTaskCount[]>;
  getLabelById: (
    userId: string,
    labelId: string,
    opts?: { includeDeleted?: boolean },
  ) => Promise<Label>;
  restoreLabel: (userId: string, labelId: string) => Promise<Label>;
  createLabel: (userId: string, newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (
    userId: string,
    labelId: string,
    labelUpdate: UpdateLabel,
  ) => Promise<Label>;
  deleteLabel: (
    userId: string,
    labelId: string,
    opts: DeleteLabelQuery,
  ) => Promise<void>;
  assignLabelToTask: (
    userId: string,
    taskId: string,
    labelId: string,
  ) => Promise<void>;
  removeLabelFromTask: (
    userId: string,
    taskId: string,
    labelId: string,
  ) => Promise<void>;
};

export const createLabelsService = (
  labelsRepository: LabelsRepository,
): LabelsService => {
  return {
    getLabels: async (userId, filters) => {
      return await labelsRepository.getLabels(userId, filters);
    },
    getLabelById: async (userId, labelId, opts) => {
      const label = await labelsRepository.getLabelById(userId, labelId, opts);
      if (!label) throw new EntityNotFoundError('Label', labelId);
      return label;
    },
    restoreLabel: async (userId, labelId) => {
      const label = await labelsRepository.restoreLabel(userId, labelId);
      if (!label) throw new EntityNotFoundError('Label', labelId);
      return label;
    },
    createLabel: async (userId, newLabel) => {
      return await labelsRepository.createLabel(userId, newLabel);
    },
    updateLabel: async (userId, labelId, labelUpdate) => {
      const updated = await labelsRepository.updateLabel(
        userId,
        labelId,
        labelUpdate,
      );
      if (!updated) throw new EntityNotFoundError('Label', labelId);
      return updated;
    },
    deleteLabel: async (userId, labelId, { removeFromTasks, permanent }) => {
      // Delete tiers per ADR-0007.
      if (removeFromTasks && permanent) {
        throw new ValidationError(
          [
            {
              message:
                '`removeFromTasks` and `permanent` cannot be combined: permanent deletion cascades task links via FK',
            },
          ],
          { removeFromTasks, permanent },
          {
            message:
              '`removeFromTasks` and `permanent` cannot be combined: permanent deletion cascades task links via FK',
            showToClient: true,
          },
        );
      }
      if (permanent) {
        const label = await labelsRepository.getLabelById(userId, labelId, {
          includeDeleted: true,
        });
        if (!label) throw new EntityNotFoundError('Label', labelId);
        if (!label.deletedAt) {
          throw new ConflictError(
            'only soft-deleted labels can be permanently deleted',
            { showToClient: true },
          );
        }
        await labelsRepository.hardDeleteLabel(userId, labelId);
        return;
      }
      const deleted = await labelsRepository.deleteLabel(
        userId,
        labelId,
        removeFromTasks,
      );
      if (!deleted) throw new EntityNotFoundError('Label', labelId);
    },
    assignLabelToTask: async (userId, taskId, labelId) => {
      const assigned = await labelsRepository.assignLabelToTask(
        userId,
        taskId,
        labelId,
      );
      if (!assigned) throw new EntityNotFoundError('Label', labelId);
    },
    removeLabelFromTask: async (userId, taskId, labelId) => {
      const removed = await labelsRepository.removeLabelFromTask(
        userId,
        taskId,
        labelId,
      );
      if (!removed) throw new EntityNotFoundError('Label', labelId);
    },
  };
};
