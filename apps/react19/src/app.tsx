import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './styles/style.css';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { useAuthSession } from './features/users/auth/auth-client';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

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
        router.invalidate();
      }
    };
  }, [auth.isPending]);
  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />,
      </QueryClientProvider>
    </StrictMode>,
  );
}
