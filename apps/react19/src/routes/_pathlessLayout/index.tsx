import { createFileRoute, Link } from '@tanstack/react-router';
import classes from './index.module.css';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { HonoClient } from '../../services/backend';
import { useCallback, useEffect, useState } from 'react';
import { TaskCard } from '../../features/tasks/components/TaskCard';
import { selectTaskSchema } from '@task-manager/backend/tasks';

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
  const { data: authData, isPending } = useAuthSession();

  const [tasks, setTasks] = useState<object[]>([]);
  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, [fetchTasks]);
  // const tasks = use(fetchTasks());

  const isLoggedIn = !!authData?.user;

  if (isPending) {
    return <div>Loading authentication...</div>;
  }

  if (!isLoggedIn) {
    return (
      <>
        <h1 className={classes['title']}>Welcome to Task Manager</h1>
        <div className={classes['login-prompt']}>
          <p>An account is required to manage tasks.</p>
          <p>
            Please <Link to='/auth/login'>sign in</Link>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={classes['title']}>Welcome to Task Manager</h1>
      {tasks?.[0] ? (
        <ul title={'task list'}>
          {tasks.map((task) => (
            <li key={task.id} className={classes['task-item']}>
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <span>No tasks found</span>
      )}
    </>
  );
}

export default Index;
