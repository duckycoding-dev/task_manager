import type { LabelsRepository } from './labels.repository';
import type { InsertLabel, Label, UpdateLabel } from './labels.db';
import type { GetLabelsQuery } from './labels.types';

export type LabelsService = {
  getLabels: (filters: GetLabelsQuery) => Promise<Label[]>;
  getLabelById: (id: string) => Promise<Label | undefined>;
  createLabel: (newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (
    id: string,
    labelUpdate: UpdateLabel,
  ) => Promise<Label | undefined>;
  deleteLabel: (id: string) => Promise<boolean>;
  assignLabelToTask: (taskId: string, labelId: string) => Promise<boolean>;
  removeLabelFromTask: (taskId: string, labelId: string) => Promise<boolean>;
};

export const createLabelsService = (
  labelsRepository: LabelsRepository,
): LabelsService => {
  return {
    getLabels: async (filters) => {
      return await labelsRepository.getLabels(filters);
    },
    getLabelById: async (id) => {
      return await labelsRepository.getLabelById(id);
    },
    createLabel: async (newLabel) => {
      return await labelsRepository.createLabel(newLabel);
    },
    updateLabel: async (id, labelUpdate) => {
      return await labelsRepository.updateLabel(id, labelUpdate);
    },
    deleteLabel: async (id) => {
      return await labelsRepository.deleteLabel(id);
    },
    assignLabelToTask: async (taskId, labelId) => {
      return await labelsRepository.assignLabelToTask(taskId, labelId);
    },
    removeLabelFromTask: async (taskId, labelId) => {
      return await labelsRepository.removeLabelFromTask(taskId, labelId);
    },
  };
};
