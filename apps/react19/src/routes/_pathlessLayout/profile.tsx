import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_pathlessLayout/profile')({
  component: RouteComponent,
  beforeLoad: async ({ location, context }) => {
    if (!context.auth.isLoggedIn) {
      throw redirect({
        to: '/auth/login',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/_pathlessLayout/profile"!</div>;
}
