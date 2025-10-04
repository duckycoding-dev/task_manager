import { selectTaskSchema, type InsertTask } from '@task-manager/backend/tasks';
import { HonoClient } from '../../lib/backend';

export async function fetchTasks() {
  const response = await (await HonoClient.tasks.$get({ query: {} })).json();
  if (!response.success) {
    throw new Error('Failed to fetch tasks');
  }

  const { data } = selectTaskSchema.array().safeParse(response.data);
  if (data) {
    return data;
  } else {
    throw new Error('Invalid task data format');
  }
}

export async function addTask(newTask: InsertTask) {
  const response = await HonoClient.tasks.$post({
    json: newTask,
  });

  if (!response.ok) {
    throw new Error('Failed to add task');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error('Failed to add task');
  }

  const parsedTask = selectTaskSchema.parse(result.data);
  return parsedTask;
}
