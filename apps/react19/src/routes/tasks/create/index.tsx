import { createFileRoute } from '@tanstack/react-router';
import { Button } from '../../../features/ui/button/Button';
import { PageTitle } from '../../../features/ui/titles/PageTitle';
import { useAuthSession } from '../../../features/users/auth/auth-client';
import { StyledLink } from '../../../features/ui/link/Link';
import { PageSubtitle } from '../../../features/ui/titles/PageSubtitle';
import { useAddTaskMutation } from '../../../features/tasks/tasks.query';

export const Route = createFileRoute('/tasks/create/')({
  component: CreateTaskRoute,
});

function CreateTaskRoute() {
  const { data: authData, isPending: authIsPending } = useAuthSession();
  const isLoggedIn = !!authData?.user;
  const addTaskMutation = useAddTaskMutation();

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
        <PageTitle className={'text-center'}>Create new Task</PageTitle>
        <div className={'text-center'}>
          <PageSubtitle>An account is required to manage tasks.</PageSubtitle>
          <p>
            Please <StyledLink to='/auth/login'>sign in</StyledLink>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle className={'text-center'}>Add new Task</PageTitle>
      FORM
      <Button
        className={'w-full mt-4'}
        onClick={() =>
          addTaskMutation.mutate(
            {
              title: `New Task ${Date.now()}`,
              description: 'This is a new task created from the index page.',
              isRecurring: false,
              dueDate: null,
              priority: 'medium',
              status: 'todo',
            },
            {
              onSuccess: () => {
                window.location.href = '/tasks';
              },
            },
          )
        }
      >
        Add new task
      </Button>
    </>
  );
}
