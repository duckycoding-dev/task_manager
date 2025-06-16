import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '../../../features/users/auth/components/forms/SignupForm';

export const Route = createFileRoute('/_pathlessLayout/auth/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignupForm />;
}
