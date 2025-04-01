import type { LabelsRepository } from './labels.repository';
import type { InsertLabel, Label, UpdateLabel } from './labels.db';
import type { GetLabelsQuery } from './labels.types';

export type LabelsService = {
  getLabels: (filters: GetLabelsQuery) => Promise<Label[]>;
  getLabelById: (id: string) => Promise<Label | undefined>;
  createLabel: (newLabel: InsertLabel) => Promise<Label>;
  updateLabel: (id: string, data: UpdateLabel) => Promise<Label | undefined>;
  deleteLabel: (id: string) => Promise<boolean>;
  assignLabelToTask: (taskId: string, labelId: string) => Promise<boolean>;
  removeLabelFromTask: (taskId: string, labelId: string) => Promise<boolean>;
};

export const createLabelsService = (
  labelsRepository: LabelsRepository,
): LabelsService => {
  return {
    getLabels: async (filters) => {
      const data = await labelsRepository.getLabels(filters);
      return data;
    },
    getLabelById: async (id) => {
      const data = await labelsRepository.getLabelById(id);
      return data;
    },
    createLabel: async (data) => {
      const label = await labelsRepository.createLabel(data);
      return label;
    },
    updateLabel: async (id, data) => {
      const label = await labelsRepository.updateLabel(id, data);
      return label;
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
