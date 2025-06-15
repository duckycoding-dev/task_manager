import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_pathlessLayout/auth/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_pathlessLayout/auth/signup"!</div>;
}
