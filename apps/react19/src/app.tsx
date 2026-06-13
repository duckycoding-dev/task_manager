import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import { useAuthSession } from './lib/auth-client';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

import './styles/style.css';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: {
      data: null,
      error: null,
      isRefetching: false, // not sure what this does, but was required
      isPending: true,
      refetch: () => Promise.resolve(),
    },
    queryClient: undefined,
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

export function App() {
  const auth = useAuthSession();
  const queryClient = useQueryClient();
  useEffect(() => {
    return () => {
      // on unmount, invalidate the router if auth is pending (pending = the auth session is being fetched so we want to ensure the latest auth state is reflected)
      if (auth.isPending) {
        void router.invalidate();
      }
    };
  }, [auth.isPending]);
  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

// Render the app
const rootElement = document?.getElementById('root');
if (rootElement && !rootElement?.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}
