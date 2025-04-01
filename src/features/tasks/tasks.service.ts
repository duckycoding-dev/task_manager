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
  createTask: (newTask: InsertTask) => Promise<Task>;
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
      return await tasksRepository.getTasks(filters);
    },
    getTasksById: async (id) => {
      return await tasksRepository.getTaskById(id);
    },

    createTask: async (task) => {
      return await tasksRepository.createTask(task);
    },

    updateTask: async (id, task) => {
      return await tasksRepository.updateTask(id, task);
    },

    deleteTask: async (id) => {
      return await tasksRepository.deleteTask(id);
    },

    updateTaskPriority: async (id, priority) => {
      return await tasksRepository.updateTaskPriority(id, priority);
    },

    updateTaskRecurringInterval: async (id, recurringInterval) => {
      return await tasksRepository.updateTaskRecurringInterval(
        id,
        recurringInterval,
      );
    },

    updateTaskIsRecurring: async (id, isRecurring) => {
      return await tasksRepository.updateTaskIsRecurring(id, isRecurring);
    },

    updateTaskStatus: async (id, status) => {
      return await tasksRepository.updateTaskStatus(id, status);
    },
  };
};
