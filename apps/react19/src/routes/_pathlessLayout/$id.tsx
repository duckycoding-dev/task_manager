import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_pathlessLayout/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams(); // same as useParams({ from: '/_pathlessLayout/$id' });

  return <div>{`Hello "/_pathlessLayout/${id}"!`}</div>;
}
