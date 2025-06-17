import { Link, useNavigate } from '@tanstack/react-router';
import classes from './navbar.module.css';
import type { HTMLAttributes } from 'react';
import { authClient, useAuthSession } from '../../users/auth/auth-client';

export const Navbar = (props: HTMLAttributes<HTMLElement>) => {
  const navigate = useNavigate();
  const { data: authData } = useAuthSession();

  const isLoggedIn = !!authData?.user;

  const handleSignout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/auth/login' });
        },
      },
    });
  };

  return (
    <nav {...props}>
      <ul className={classes['nav-list']}>
        <li>
          <Link to='/'>Home</Link>
        </li>
        {isLoggedIn ? (
          <div className={classes['profile-section']}>
            <li>
              <Link to='/profile'>Profile</Link>
            </li>
            <li>
              <button
                className={classes['logout-button']}
                onClick={handleSignout}
              >
                Logout
              </button>
            </li>
          </div>
        ) : (
          <li className={classes['profile-section']}>
            <Link to='/auth/login'>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
