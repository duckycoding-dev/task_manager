import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { selectTaskSchema } from '@task-manager/backend/tasks';
import { TaskList } from '../../features/tasks/components/task-list/TaskList';
import { PageTitle } from '../../features/ui/titles/PageTitle';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { HonoClient } from '../../services/backend';
import { StyledLink } from '../../features/ui/link/Link';

export const Route = createFileRoute('/tasks')({
  component: TasksRoute,
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

function TasksRoute() {
  const { data: authData, isPending: authIsPending } = useAuthSession();
  const isLoggedIn = !!authData?.user;
  const { data: tasks, isLoading: tasksAreLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!authData?.user, // Only fetch tasks if the user is logged in
  });

  if (authIsPending) {
    return (
      <>
        <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
        <p>Fetching user data...</p>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
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
        <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
        <p>Fetching data...</p>
      </>
    );
  }

  return (
    <>
      <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
      {tasks?.[0] ? <TaskList tasks={tasks} /> : <span>No tasks found</span>}
      <StyledLink className={'w-full mt-4'} to='/tasks/create'>
        Add new task
      </StyledLink>
    </>
  );
}
