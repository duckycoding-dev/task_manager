import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { HonoClient } from '../../services/backend';
import { useCallback } from 'react';
import { selectTaskSchema, type InsertTask } from '@task-manager/backend/tasks';
import { TaskList } from '../../features/tasks/components/task-list/TaskList';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../features/ui/button/Button';

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

const titleClass = 'text-2xl mb-4 font-bold text-center';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
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
        <h1 className={titleClass}> Welcome to Task Manager</h1>
        <p>Fetching user data...</p>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <h1 className={titleClass}> Welcome to Task Manager</h1>
        <div className={'text-center'}>
          <p>An account is required to manage tasks.</p>
          <p>
            Please <Link to='/auth/login'>sign in</Link>
          </p>
        </div>
      </>
    );
  }

  if (tasksAreLoading) {
    return (
      <>
        <h1 className={titleClass}> Welcome to Task Manager</h1>
        <p>Fetching data...</p>
      </>
    );
  }

  return (
    <>
      <h1 className={titleClass}>Welcome to Task Manager</h1>
      {tasks?.[0] ? <TaskList tasks={tasks} /> : <span>No tasks found</span>}
      <Button
        className={'w-full mt-4'}
        onClick={() => addTaskMutation.mutate()}
      >
        Add new task
      </Button>
    </>
  );
}

export default Index;
