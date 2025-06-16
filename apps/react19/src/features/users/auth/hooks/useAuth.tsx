import { useContext } from 'react';
import { AuthContext, AuthDispatchContext } from '../context/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthContext provider');
  }

  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);

  if (!context) {
    throw new Error(
      'useAuthDispatch must be used within an AuthDispatchContext provider',
    );
  }

  return context;
};
