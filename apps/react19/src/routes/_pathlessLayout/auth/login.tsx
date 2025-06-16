import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../../../features/users/auth/components/forms/LoginForm';

export const Route = createFileRoute('/_pathlessLayout/auth/login')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    console.log(context.auth.isLoggedIn);
    if (context.auth.isLoggedIn) {
      return redirect({ to: '/' });
    }
    return;
  },
});

function RouteComponent() {
  return <LoginForm />;
}
