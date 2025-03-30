import type { TasksRepository } from './tasks.repository';
import type { InsertTask, Task, UpdateTask } from './tasks.db';
import type {
  GetTasksQuery,
  TaskPriorityOption,
  TaskRecurringOption,
  TaskStatusOption,
} from './tasks.types';

export type TasksService = {
  getTasks: (
    filters: Omit<GetTasksQuery, 'dueDate'> & { dueDate?: Date },
  ) => Promise<Task[]>;
  getTasksById: (id: string) => Promise<Task | undefined>;
  createTask: (task: InsertTask) => Promise<Task>;
  updateTask: (id: string, task: UpdateTask) => Promise<Task | undefined>;
  deleteTask: (id: string) => Promise<boolean>;
  updateTaskPriority: (
    id: string,
    priority: TaskPriorityOption,
  ) => Promise<Task | undefined>;
  updateTaskRecurringInterval: (
    id: string,
    recurringInterval: TaskRecurringOption,
  ) => Promise<Task | undefined>;
  updateTaskIsRecurring: (
    id: string,
    recurringInterval: boolean,
  ) => Promise<Task | undefined>;
  updateTaskStatus: (
    id: string,
    status: TaskStatusOption,
  ) => Promise<Task | undefined>;
};

export const createTasksService = (
  tasksRepository: TasksRepository,
): TasksService => {
  return {
    getTasks: async (filters) => {
      const tasks = await tasksRepository.getTasks(filters);
      return tasks;
    },
    getTasksById: async (id) => {
      const task = await tasksRepository.getTaskById(id);
      return task;
    },

    createTask: async (task) => {
      const createdTask = await tasksRepository.createTask(task);
      return createdTask;
    },

    updateTask: async (id, task) => {
      const updatedTask = await tasksRepository.updateTask(id, task);
      return updatedTask;
    },

    deleteTask: async (id) => {
      const deleted = await tasksRepository.deleteTask(id);
      return deleted;
    },

    updateTaskPriority: async (id, priority) => {
      const updatedTask = await tasksRepository.updateTaskPriority(
        id,
        priority,
      );
      return updatedTask;
    },

    updateTaskRecurringInterval: async (id, recurringInterval) => {
      const updatedTask = await tasksRepository.updateTaskRecurringInterval(
        id,
        recurringInterval,
      );
      return updatedTask;
    },

    updateTaskIsRecurring: async (id, isRecurring) => {
      const updatedTask = await tasksRepository.updateTaskIsRecurring(
        id,
        isRecurring,
      );
      return updatedTask;
    },

    updateTaskStatus: async (id, status) => {
      const updatedTask = await tasksRepository.updateTaskStatus(id, status);
      return updatedTask;
    },
  };
};
