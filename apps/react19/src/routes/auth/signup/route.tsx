import { createFileRoute, redirect } from '@tanstack/react-router';
import { SignupForm } from '../../../features/users/auth/components/forms/signup-form/SignupForm';
import classes from './signup.module.css';
import { PageTitle } from '../../../features/ui/titles/PageTitle';

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.auth.data?.user) {
      return redirect({ to: '/' });
    }
    return;
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <>
      <PageTitle className={classes['title']}>Signup</PageTitle>
      <SignupForm onSuccess={() => navigate({ to: '/' })} />
    </>
  );
}
