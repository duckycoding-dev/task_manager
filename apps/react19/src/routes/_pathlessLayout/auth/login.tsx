import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../../../features/users/auth/components/forms/LoginForm';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_pathlessLayout/auth/login')({
  component: RouteComponent,
  validateSearch: (search) => searchParamsSchema.parse(search),
  beforeLoad: async ({ context }) => {
    if (context.auth.data?.user) {
      return redirect({ to: '/' });
    }
    return;
  },
});

function RouteComponent() {
  const context = Route.useRouteContext();
  const search = Route.useSearch();

  if (context.auth.isPending) {
    return <div>Loading authentication...</div>;
  }
  return <LoginForm redirectTo={search.redirect ?? '/'} />;
}
