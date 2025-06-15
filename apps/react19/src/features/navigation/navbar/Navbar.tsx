import { Link } from '@tanstack/react-router';
import { useAuth, useAuthDispatch } from '../../users/auth/hooks/useAuth';
import classes from './Navbar.module.css';

export const Navbar = () => {
  const { isLoggedIn } = useAuth();
  const dispatch = useAuthDispatch();

  const handleSignout = () => {
    dispatch({ type: 'SIGN_OUT' });
  };

  return (
    <nav>
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
