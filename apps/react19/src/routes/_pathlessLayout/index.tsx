import { createFileRoute, Link } from '@tanstack/react-router';
import classes from './index.module.css';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { HonoClient } from '../../services/backend';
import { useCallback, useEffect, useState } from 'react';
import {
  selectTaskSchema,
  type InsertTask,
  type Task,
} from '@task-manager/backend/tasks';
import { TaskList } from '../../features/tasks/components/task-list/TaskList';

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

  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, [fetchTasks]);
  // const tasks = use(fetchTasks());

  const isLoggedIn = !!authData?.user;

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
      setTasks((prevTasks) => [...prevTasks, parsedTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, []);

  if (isPending) {
    return <div>Loading...</div>;
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

  return (
    <>
      <h1 className={classes['title']}>Welcome to Task Manager</h1>
      {tasks?.[0] ? <TaskList tasks={tasks} /> : <span>No tasks found</span>}
      <button type='button' onClick={handleAddTask}>
        Add new task
      </button>
    </>
  );
}

export default Index;
