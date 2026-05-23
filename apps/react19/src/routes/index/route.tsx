import { createFileRoute } from '@tanstack/react-router';

import { StyledLink } from '../../features/ui/link/Link';
import { PageTitle } from '../../features/ui/titles/PageTitle';
import { useAuthSession } from '../../lib/auth-client';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { data: authData, isPending: authIsPending } = useAuthSession();
  const isLoggedIn = !!authData?.user;

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

  return (
    <>
      <PageTitle className={'text-center'}>Welcome to Task Manager</PageTitle>
      <StyledLink className={'mt-4 w-full'} to='/tasks'>
        Browse tasks
      </StyledLink>
    </>
  );
}

export default Index;
