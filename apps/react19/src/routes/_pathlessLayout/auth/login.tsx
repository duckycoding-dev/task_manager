import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '../../../features/users/auth/LoginForm';

export const Route = createFileRoute('/_pathlessLayout/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Login</h1>
      <LoginForm />
    </>
  );
}
