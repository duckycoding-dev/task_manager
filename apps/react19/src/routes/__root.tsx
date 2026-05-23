import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  type ErrorComponentProps,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useState } from 'react';

import { Button } from '../features/ui/button/Button';
import { StyledLink } from '../features/ui/link/Link';
import { HolyGrailLayout } from '../layouts/HolyGrailLayout';
import type { useAuthSession } from '../lib/auth-client';

export interface MyRouterContext {
  auth: ReturnType<typeof useAuthSession>;
  queryClient?: QueryClient;
}

function MyCustomErrorComponent({ error }: ErrorComponentProps) {
  // You can inspect the 'error' object to display different messages
  // or apply different styles based on the error type.
  const [showTrace, setShowTrace] = useState(false);

  return (
    <div
      className={
        'bg-accent border-error flex flex-col gap-4 border p-5 [grid-area:main-content]'
      }
    >
      <h1 className='p-6'>Oops! Something went wrong.</h1>
      {/* Optionally display error details in development */}
      {import.meta.env.DEV ? (
        <>
          <h2>Error:</h2>
          <pre className='bg-accent flex flex-col gap-2 rounded-md border-2 px-2 py-4 break-all whitespace-pre-wrap'>
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
