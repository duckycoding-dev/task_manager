import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../../../features/users/auth/components/forms/login-form/LoginForm';
import { z } from 'zod/v4';
import { PageTitle } from '../../../features/ui/titles/PageTitle';

const searchParamsSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/auth/login')({
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
  const search = Route.useSearch();

  return (
    <>
      <PageTitle className={'text-center'}>Login</PageTitle>
      <LoginForm redirectTo={search.redirect ?? '/'} />
    </>
  );
}
