import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../../features/users/auth/hooks/useAuth';

export const Route = createFileRoute('/_pathlessLayout/')({
  component: Index,
});

function Index() {
  const { isLoggedIn } = useAuth();

  return (
    <div>
      <h1>Welcome to Task Manager</h1>
      {isLoggedIn ? (
        <div>
          content Lorem ipsum dolor, sit amet consectetur adipisicing elit.
          Dolorem accusamus officia ullam. Veritatis ex maxime, exercitationem
          vitae nulla corporis libero!
        </div>
      ) : (
        <div>
          <h2>
            Please <Link to='/auth/login'>sign in</Link>
          </h2>
        </div>
      )}
    </div>
  );
}

export default Index;
