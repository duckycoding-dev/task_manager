import { Outlet, createFileRoute } from '@tanstack/react-router';
import { HolyGrailLayout } from '../../layouts/HolyGrailLayout';

// This route is a pathless layout. It will be used to wrap other routes
// this file must be named `_pathlessLayout.tsx` or `_pathlessLayout/route.tsx`
export const Route = createFileRoute('/_pathlessLayout')({
  component: PathlessLayoutComponent,
});

// this component is extra actually, I could have wrapped the __root component directly with the HolyGrailLayout
// but I wanted to keep this to demonstrate how to create and use a pathless layout

function PathlessLayoutComponent() {
  return (
    <>
      <HolyGrailLayout>
        <Outlet />
      </HolyGrailLayout>
    </>
  );
}
