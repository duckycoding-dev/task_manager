import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InsertTask, Task } from '@task-manager/backend/tasks';
import { addTask, fetchTasks } from './tasks.service';
import type { AuthData } from '../users/auth/auth-client';

export const useTasksQuery = (authData: AuthData) => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!authData?.user, // Only fetch tasks if the user is logged in
  });
};

export const useAddTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addTask'],
    mutationFn: async (newTask: InsertTask): Promise<Task> => {
      return await addTask(newTask);
    },
    onMutate: async (newTask: InsertTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistically update to the new value
      const optimisticTask: Task = {
        ...newTask,
        id: `temp-${Date.now()}`, // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;

      queryClient.setQueryData(['tasks'], (oldTasks: Task[] | undefined) => {
        return [...(oldTasks ?? []), optimisticTask];
      });

      // Return a context object with the snapshotted value
      return { previousTasks, optimisticTask };
    },
    onError: (error, _newTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      console.error('Error adding task:', error);
    },
    onSuccess: (insertedTask: Task, _newTask, context) => {
      // Replace the optimistic task with the real one
      console.log('Task added successfully:', insertedTask);
      queryClient.setQueryData(['tasks'], (oldTasks: Task[] | undefined) => {
        return (oldTasks ?? []).map((task) =>
          task.id === context?.optimisticTask.id ? insertedTask : task,
        );
      });
    },
  });
};
