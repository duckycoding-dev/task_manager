import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../../features/users/auth/hooks/useAuth';
import classes from './index.module.css';

export const Route = createFileRoute('/_pathlessLayout/')({
  component: Index,
});

function Index() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <h1 className={classes['title']}>Welcome to Task Manager</h1>
      {isLoggedIn ? (
        <ul title={'task list'}>
          <li>Task 1</li>
          <li>Task 2</li>
          <li>Task 3</li>
        </ul>
      ) : (
        <div className={classes['login-prompt']}>
          <p>An account is required to manage tasks.</p>
          <p>
            Please <Link to='/auth/login'>sign in</Link>
          </p>
        </div>
      )}
    </>
  );
}

export default Index;
