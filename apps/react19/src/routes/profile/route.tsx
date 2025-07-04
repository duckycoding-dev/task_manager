import { createFileRoute, redirect } from '@tanstack/react-router';
import { PageTitle } from '../../features/ui/titles/PageTitle';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
  beforeLoad: async ({ location, context }) => {
    if (!context.auth.data?.user && !context.auth.isPending) {
      return redirect({
        to: '/auth/login',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
    return;
  },
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  if (auth.isPending) {
    return <h1>Loading...</h1>;
  }
  return (
    <PageTitle className={'text-center'}>
      Hello {auth.data?.user?.name}!
    </PageTitle>
  );
}
