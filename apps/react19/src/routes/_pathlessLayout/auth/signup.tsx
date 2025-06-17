import { createFileRoute, redirect } from '@tanstack/react-router';
import { SignupForm } from '../../../features/users/auth/components/forms/SignupForm';

export const Route = createFileRoute('/_pathlessLayout/auth/signup')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.auth.data?.user) {
      return redirect({ to: '/' });
    }
    return;
  },
});

function RouteComponent() {
  return <SignupForm />;
}
