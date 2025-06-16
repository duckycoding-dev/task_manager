import type { ReactNode } from '@tanstack/react-router';
import { createContext, useReducer, type Dispatch } from 'react';

export type AuthState =
  | {
      isLoggedIn: true;
      userEmail: string;
    }
  | {
      isLoggedIn: false;
      userEmail?: never;
    };

export type AuthAction =
  | { type: 'SIGN_IN'; payload: { userEmail: string } }
  | { type: 'SIGN_OUT' };

const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        isLoggedIn: true,
        userEmail: action.payload.userEmail,
      } as const satisfies AuthState;
    case 'SIGN_OUT':
      return {
        isLoggedIn: false,
      } as const satisfies AuthState;
    default:
      // It's good practice to throw an error for unhandled actions
      // to catch bugs early.
      throw new Error(`Unhandled action type in authReducer`);
  }
};

export const initialAuthState: AuthState = {
  isLoggedIn: false,
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
export const AuthDispatchContext = createContext<
  Dispatch<AuthAction> | undefined
>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
};
