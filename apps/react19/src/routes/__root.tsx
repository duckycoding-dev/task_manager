import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { useAuthSession } from '../features/users/auth/auth-client';
import { HolyGrailLayout } from '../layouts/HolyGrailLayout';
export interface MyRouterContext {
  auth: ReturnType<typeof useAuthSession>;
  queryClient?: import('@tanstack/react-query').QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: MainLayout,
  notFoundComponent: () => (
    <div>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  ),
});

function MainLayout() {
  return (
    <>
      <HolyGrailLayout>
        <Outlet />
      </HolyGrailLayout>
      <TanStackRouterDevtools />
    </>
  );
}
