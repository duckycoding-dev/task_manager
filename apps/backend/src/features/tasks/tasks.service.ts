import { EntityNotFoundError } from 'utils/errors/domain-errors/';

import type { Reminder } from '../reminders';

import type { InsertTask, Task, UpdateTask } from './tasks.db';
import type { TasksRepository } from './tasks.repository';
import type {
  GetTasksQuery,
  TaskPriorityOption,
  TaskRecurringOption,
  TaskStatusOption,
} from './tasks.types';

export type TasksService = {
  getTasks: (
    userId: string,
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTaskById: (userId: string, id: string) => Promise<Task>;
  createTask: (userId: string, newTask: InsertTask) => Promise<Task>;
  updateTask: (userId: string, id: string, task: UpdateTask) => Promise<Task>;
  deleteTask: (userId: string, id: string) => Promise<void>;
  updateTaskPriority: (
    userId: string,
    id: string,
    priority: TaskPriorityOption,
  ) => Promise<Task>;
  updateTaskRecurringInterval: (
    userId: string,
    id: string,
    recurringInterval: TaskRecurringOption,
  ) => Promise<Task>;
  updateTaskStatus: (
    userId: string,
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task>;
  getTaskReminders: (userId: string, taskId: string) => Promise<Reminder[]>;
};

export const createTasksService = (
  tasksRepository: TasksRepository,
): TasksService => {
  return {
    getTasks: async (userId, filters) => {
      return await tasksRepository.getTasks(userId, filters);
    },
    getTaskById: async (userId, taskId) => {
      const task = await tasksRepository.getTaskById(userId, taskId);
      if (!task) throw new EntityNotFoundError('Task', taskId);
      return task;
    },

    createTask: async (userId, task) => {
      return await tasksRepository.createTask(userId, task);
    },

    updateTask: async (userId, id, task) => {
      const updated = await tasksRepository.updateTask(userId, id, task);
      if (!updated) throw new EntityNotFoundError('Task', id);
      return updated;
    },

    deleteTask: async (userId, taskId) => {
      const deleted = await tasksRepository.deleteTask(userId, taskId);
      if (!deleted) throw new EntityNotFoundError('Task', taskId);
    },

    updateTaskPriority: async (userId, taskId, priority) => {
      const updated = await tasksRepository.updateTaskPriority(
        userId,
        taskId,
        priority,
      );
      if (!updated) throw new EntityNotFoundError('Task', taskId);
      return updated;
    },

    updateTaskRecurringInterval: async (userId, taskId, recurringInterval) => {
      const updated = await tasksRepository.updateTaskRecurringInterval(
        userId,
        taskId,
        recurringInterval,
      );
      if (!updated) throw new EntityNotFoundError('Task', taskId);
      return updated;
    },

    updateTaskStatus: async (userId, taskId, status) => {
      const updated = await tasksRepository.updateTaskStatus(
        userId,
        taskId,
        status,
      );
      if (!updated) throw new EntityNotFoundError('Task', taskId);
      return updated;
    },

    getTaskReminders: async (userId, taskId) => {
      return await tasksRepository.getTaskReminders(userId, taskId);
    },
  };
};
