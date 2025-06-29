import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { selectTaskSchema, type InsertTask } from '@task-manager/backend/tasks';
import { Button } from '../../../features/ui/button/Button';
import { PageTitle } from '../../../features/ui/titles/PageTitle';
import { useAuthSession } from '../../../features/users/auth/auth-client';
import { HonoClient } from '../../../services/backend';
import { useCallback } from 'react';
import { StyledLink } from '../../../features/ui/link/Link';

export const Route = createFileRoute('/tasks/create')({
  component: CreateTaskRoute,
});

async function fetchTasks() {
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

function CreateTaskRoute() {
  const queryClient = useQueryClient();
  const { data: authData, isPending: authIsPending } = useAuthSession();
  const isLoggedIn = !!authData?.user;
  const { data: tasks, isLoading: tasksAreLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!authData?.user, // Only fetch tasks if the user is logged in
  });

  const handleAddTask = useCallback(async () => {
    // This function would typically open a modal or redirect to a form for adding a new task
    // for now we create tasks with dummy data

    const newTask: InsertTask = {
      title: `New Task ${Date.now()}`,
      description: 'This is a new task created from the index page.',
      isRecurring: false,
      dueDate: null,
      priority: 'medium',
      status: 'todo',
    };

    try {
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
      // Optionally, you can refetch tasks or update the state with the new task
      return [...(tasks ?? []), parsedTask];
    } catch (error) {
      console.error('Error adding task:', error);
      return tasks ?? [];
    }
  }, [tasks]);

  const addTaskMutation = useMutation({
    mutationKey: ['addTask'],
    mutationFn: handleAddTask,
    onSuccess: (newData) => {
      queryClient.setQueryData(['tasks'], newData);
    },
  });

  if (authIsPending) {
    return (
      <>
        <PageTitle className={'text-center'}>
          {' '}
          Welcome to Task Manager
        </PageTitle>
        <p>Fetching user data...</p>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <PageTitle className={'text-center'}>
          {' '}
          Welcome to Task Manager
        </PageTitle>
        <div className={'text-center'}>
          <p>An account is required to manage tasks.</p>
          <p>
            Please <StyledLink to='/auth/login'>sign in</StyledLink>
          </p>
        </div>
      </>
    );
  }

  if (tasksAreLoading) {
    return (
      <>
        <PageTitle className={'text-center'}>
          {' '}
          Welcome to Task Manager
        </PageTitle>
        <p>Fetching data...</p>
      </>
    );
  }

  return (
    <>
      <PageTitle className={'text-center'}>Add new Task</PageTitle>
      FORM
      <Button
        className={'w-full mt-4'}
        onClick={() => addTaskMutation.mutate()}
      >
        Add new task
      </Button>
    </>
  );
}
