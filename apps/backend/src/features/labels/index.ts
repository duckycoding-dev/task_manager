// this file contains everything related to labels that can be used in the other packages

export type {
  InsertLabel,
  InsertTaskLabel,
  Label,
  TaskLabel,
  UpdateLabel,
  UpdateTaskLabel,
} from './labels.db';
export {
  insertLabelSchema,
  insertTaskLabelsSchema,
  selectLabelSchema,
  selectTaskLabelsSchema,
  updateLabelSchema,
  updateTaskLabelsSchema,
} from './labels.db';
