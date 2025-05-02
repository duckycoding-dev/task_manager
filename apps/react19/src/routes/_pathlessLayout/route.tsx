import { Outlet, createFileRoute } from '@tanstack/react-router';
import { HolyGrailLayout } from '../../layouts/HolyGrailLayout';

// This route is a pathless layout. It will be used to wrap other routes
// this file must be named `_pathlessLayout.tsx` or `_pathlessLayout/route.tsx`
export const Route = createFileRoute('/_pathlessLayout')({
  component: PathlessLayoutComponent,
});

function PathlessLayoutComponent() {
  return (
    <HolyGrailLayout>
      <Outlet />
    </HolyGrailLayout>
  );
}
