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
import classes from './app.module.css';

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
  // defaultNotFoundComponent: () => (
  //   <div className={classes['not-found-page']}>
  //     <h1>404 - Not Found</h1>
  //     <p>The page you are looking for does not exist.</p>
  //   </div>
  // ),
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
    if (!auth.isPending) {
      router.invalidate();
    }
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
