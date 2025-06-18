import {
  createRootRouteWithContext,
  Link,
  Outlet,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { useAuthSession } from '../features/users/auth/auth-client';
import { HolyGrailLayout } from '../layouts/HolyGrailLayout';
import { Button } from '../features/ui/button/Button';
import { useState } from 'react';
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
      style={{
        gridArea: 'main-content',
        padding: '20px',
        backgroundColor: '#fdd',
        border: '1px solid #c00',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h1 style={{ fontSize: '1.5rem' }}>Oops! Something went wrong.</h1>
      {/* Optionally display error details in development */}
      {import.meta.env.DEV ? (
        <>
          <h2>Error:</h2>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              backgroundColor: '#fdd',
              border: `2px solid #c40f0f`,
              padding: '1rem 0.5rem',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
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
          <Link to='/'>Go back to the homepage</Link>
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
