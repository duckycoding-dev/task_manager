import type { TasksRepository } from './tasks.repository';
import type { InsertTask, Task, UpdateTask } from './tasks.db';
import type {
  GetTasksQuery,
  TaskPriorityOption,
  TaskRecurringOption,
  TaskStatusOption,
} from './tasks.types';
import type { Reminder } from '../reminders';

export type TasksService = {
  getTasks: (
    userId: string,
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTasksById: (userId: string, id: string) => Promise<Task | undefined>;
  createTask: (userId: string, newTask: InsertTask) => Promise<Task>;
  updateTask: (
    userId: string,
    id: string,
    task: UpdateTask,
  ) => Promise<Task | undefined>;
  deleteTask: (userId: string, id: string) => Promise<boolean>;
  updateTaskPriority: (
    userId: string,
    id: string,
    priority: TaskPriorityOption,
  ) => Promise<Task | undefined>;
  updateTaskRecurringInterval: (
    userId: string,
    id: string,
    recurringInterval: TaskRecurringOption,
  ) => Promise<Task | undefined>;
  updateTaskIsRecurring: (
    userId: string,
    id: string,
    recurringInterval: boolean,
  ) => Promise<Task | undefined>;
  updateTaskStatus: (
    userId: string,
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task | undefined>;
  getTaskReminders: (userId: string, taskId: string) => Promise<Reminder[]>;
};

export const createTasksService = (
  tasksRepository: TasksRepository,
): TasksService => {
  return {
    getTasks: async (userId, filters) => {
      return await tasksRepository.getTasks(userId, filters);
    },
    getTasksById: async (userId, taskId) => {
      return await tasksRepository.getTaskById(userId, taskId);
    },

    createTask: async (userId, task) => {
      return await tasksRepository.createTask(userId, task);
    },

    updateTask: async (userId, id, task) => {
      return await tasksRepository.updateTask(userId, id, task);
    },

    deleteTask: async (userId, taskId) => {
      return await tasksRepository.deleteTask(userId, taskId);
    },

    updateTaskPriority: async (userId, taskId, priority) => {
      return await tasksRepository.updateTaskPriority(userId, taskId, priority);
    },

    updateTaskRecurringInterval: async (userId, taskId, recurringInterval) => {
      return await tasksRepository.updateTaskRecurringInterval(
        userId,
        taskId,
        recurringInterval,
      );
    },

    updateTaskIsRecurring: async (userId, taskId, isRecurring) => {
      return await tasksRepository.updateTaskIsRecurring(
        userId,
        taskId,
        isRecurring,
      );
    },

    updateTaskStatus: async (userId, taskId, status) => {
      return await tasksRepository.updateTaskStatus(userId, taskId, status);
    },

    getTaskReminders: async (userId, taskId) => {
      return await tasksRepository.getTaskReminders(userId, taskId);
    },
  };
};
