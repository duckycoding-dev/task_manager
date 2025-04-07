import type { LabelsRepository } from './labels.repository';
import type { InsertLabel, Label, UpdateLabel } from './labels.db';
import type { GetLabelsQuery } from './labels.types';

export type LabelsService = {
  getLabels: (userId: string, filters: GetLabelsQuery) => Promise<Label[]>;
  getLabelById: (userId: string, labelId: string) => Promise<Label | undefined>;
  createLabel: (userId: string, newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (
    userId: string,
    labelId: string,
    labelUpdate: UpdateLabel,
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

export const createLabelsService = (
  labelsRepository: LabelsRepository,
): LabelsService => {
  return {
    getLabels: async (userId, filters) => {
      return await labelsRepository.getLabels(userId, filters);
    },
    getLabelById: async (userId, labelId) => {
      return await labelsRepository.getLabelById(userId, labelId);
    },
    createLabel: async (userId, newLabel) => {
      return await labelsRepository.createLabel(userId, newLabel);
    },
    updateLabel: async (userId, labelId, labelUpdate) => {
      return await labelsRepository.updateLabel(userId, labelId, labelUpdate);
    },
    deleteLabel: async (userId, labelId) => {
      return await labelsRepository.deleteLabel(userId, labelId);
    },
    assignLabelToTask: async (userId, taskId, labelId) => {
      return await labelsRepository.assignLabelToTask(userId, taskId, labelId);
    },
    removeLabelFromTask: async (userId, taskId, labelId) => {
      return await labelsRepository.removeLabelFromTask(
        userId,
        taskId,
        labelId,
      );
    },
  };
};
