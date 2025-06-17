import { createFileRoute, Link } from '@tanstack/react-router';
import classes from './index.module.css';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { HonoClient } from '../../services/backend';
import { useCallback } from 'react';
import { selectTaskSchema, type InsertTask } from '@task-manager/backend/tasks';
import { TaskList } from '../../features/tasks/components/task-list/TaskList';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/_pathlessLayout/')({
  component: Index,
});

function Index() {
  const fetchTasks = useCallback(async () => {
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
  }, []);
  const { data: authData, isPending: authIsPending } = useAuthSession();
  // const [tasks, setTasks] = useState<Task[]>([]);

  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
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
    mutationFn: handleAddTask,
    onSuccess: (newData) => {
      queryClient.setQueryData(['tasks'], newData);
    },
  });

  const isLoggedIn = !!authData?.user;

  if (authIsPending) {
    return (
      <>
        <h1 className={classes['title']}> Welcome to Task Manager</h1>
        <p>Fetching user data...</p>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <h1 className={classes['title']}> Welcome to Task Manager</h1>
        <div className={classes['login-prompt']}>
          <p>An account is required to manage tasks.</p>
          <p>
            Please <Link to='/auth/login'>sign in</Link>
          </p>
        </div>
      </>
    );
  }

  if (isLoading && !tasks) {
    return (
      <>
        <h1 className={classes['title']}> Welcome to Task Manager</h1>
        <p>Fetching data...</p>
      </>
    );
  }

  return (
    <>
      <h1 className={classes['title']}>Welcome to Task Manager</h1>
      {tasks?.[0] ? <TaskList tasks={tasks} /> : <span>No tasks found</span>}
      <button type='button' onClick={() => addTaskMutation.mutate()}>
        Add new task
      </button>
    </>
  );
}

export default Index;
