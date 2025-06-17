import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './styles/style.css';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { useAuthSession } from './features/users/auth/auth-client';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      data: null,
      error: null,
      isPending: true,
      refetch: () => Promise.resolve(),
    },
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export interface MyRouterContext {
  auth: ReturnType<typeof useAuthSession>;
}

function App() {
  const auth = useAuthSession();
  useEffect(() => {
    if (!auth.isPending) {
      router.invalidate();
    }
  }, [auth.isPending]);
  return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />,
    </StrictMode>,
  );
}
