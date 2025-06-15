import { Outlet, createFileRoute } from '@tanstack/react-router';
import { HolyGrailLayout } from '../../layouts/HolyGrailLayout';
import { Navbar } from '../../features/navigation/navbar/Navbar';

// This route is a pathless layout. It will be used to wrap other routes
// this file must be named `_pathlessLayout.tsx` or `_pathlessLayout/route.tsx`
export const Route = createFileRoute('/_pathlessLayout')({
  component: PathlessLayoutComponent,
});

function PathlessLayoutComponent() {
  return (
    <>
      <Navbar />
      <HolyGrailLayout>
        <Outlet />
      </HolyGrailLayout>
    </>
  );
}
