import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './styles/style.css';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import {
  AuthProvider,
  initialAuthState,
  type AuthState,
} from './features/users/auth/AuthProvider';
import { useAuth } from './features/users/auth/hooks/useAuth';

// Create a new router instance
const router = createRouter({ routeTree, context: { auth: initialAuthState } });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export interface MyRouterContext {
  // The ReturnType of your useAuth hook or the value of your AuthContext
  auth: AuthState;
}

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}
