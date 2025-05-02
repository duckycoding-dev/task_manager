// this file contains everything related to reminders that can be used in the other packages

export type { InsertReminder, Reminder, UpdateReminder } from './reminders.db';

export {
  insertReminderSchema,
  selectReminderSchema,
  updateReminderSchema,
} from './reminders.db';
