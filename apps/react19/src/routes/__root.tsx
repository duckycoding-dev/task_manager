import {
  createRootRouteWithContext,
  Outlet,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { useAuthSession } from '../features/users/auth/auth-client';
import { HolyGrailLayout } from '../layouts/HolyGrailLayout';
import { Button } from '../features/ui/button/Button';
import { useState } from 'react';
import { StyledLink } from '../features/ui/link/Link';
export interface MyRouterContext {
  auth: ReturnType<typeof useAuthSession>;
  queryClient?: import('@tanstack/react-query').QueryClient;
}

function MyCustomErrorComponent({ error }: ErrorComponentProps) {
  // You can inspect the 'error' object to display different messages
  // or apply different styles based on the error type.
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div
      className={
        '[grid-area:main-content] p-5 bg-accent border border-error flex flex-col gap-4'
      }
    >
      <h1 className='p-6'>Oops! Something went wrong.</h1>
      {/* Optionally display error details in development */}
      {import.meta.env.DEV ? (
        <>
          <h2>Error:</h2>
          <pre className='whitespace-pre-wrap break-all bg-accent border-2 py-4 px-2 rounded-md flex flex-col gap-2'>
            {error.message || 'No error message provided.'}
            <br />
            {showTrace ? <span>{error.stack}</span> : ''}
          </pre>
          <Button onClick={() => setShowTrace((prev) => !prev)}>
            Show trace
          </Button>
        </>
      ) : (
        <div>
          <p>
            An unexpected error occurred. Please try again later or contact
            support.
          </p>
          <StyledLink to='/'>Go back to the homepage</StyledLink>
        </div>
      )}
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: MainLayout,
  errorComponent: MyCustomErrorComponent,
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
