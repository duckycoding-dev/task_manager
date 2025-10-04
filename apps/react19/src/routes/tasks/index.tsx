import { createFileRoute, Outlet } from '@tanstack/react-router';
import { TaskList } from '../../features/tasks/components/task-list/TaskList';
import { PageTitle } from '../../features/ui/titles/PageTitle';
import { useAuthSession } from '../../features/users/auth/auth-client';
import { StyledLink } from '../../features/ui/link/Link';
import { PageSubtitle } from '../../features/ui/titles/PageSubtitle';
import { useTasksQuery } from '../../features/tasks/tasks.query';

export const Route = createFileRoute('/tasks/')({
  component: TasksRoute,
});

function TasksRoute() {
  const { data: authData, isPending: authIsPending } = useAuthSession();
  const isLoggedIn = !!authData?.user;
  const { data: tasks, isLoading: tasksAreLoading } = useTasksQuery(authData);

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
          <PageSubtitle>An account is required to manage tasks.</PageSubtitle>
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
    <div className='flex flex-col gap-4'>
      <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
      <section className='flex flex-col gap-4'>
        {tasks?.[0] ? (
          <TaskList tasks={tasks} />
        ) : (
          <PageSubtitle>No tasks found</PageSubtitle>
        )}
        <StyledLink to='/tasks/create'>Add new task</StyledLink>
      </section>
    </div>
  );
}
