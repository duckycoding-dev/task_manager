import { Link } from '@tanstack/react-router';
import classes from './navbar.module.css';
import type { HTMLAttributes } from 'react';
import { useAuthSession } from '../../users/auth/auth-client';

export const Navbar = (props: HTMLAttributes<HTMLElement>) => {
  const { data: authData } = useAuthSession();

  const isLoggedIn = !!authData?.user;

  const handleSignout = () => {};

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
              <button onClick={handleSignout}>Logout</button>
            </li>
          </div>
        ) : (
          <li className={classes['profile-section']}>
            <Link to='/auth/login'>Login</Link>
            <Link to='/auth/signup'>Signup</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
