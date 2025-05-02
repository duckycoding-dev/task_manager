// this file contains everything related to labels that can be used in the other packages

export type {
  InsertLabel,
  Label,
  UpdateLabel,
  InsertTaskLabel,
  TaskLabel,
  UpdateTaskLabel,
} from './labels.db';

export {
  insertLabelSchema,
  insertTaskLabelsSchema,
  updateLabelSchema,
  updateTaskLabelsSchema,
  selectLabelSchema,
  selectTaskLabelsSchema,
} from './labels.db';
