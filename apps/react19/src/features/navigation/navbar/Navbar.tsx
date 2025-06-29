import { Link, useNavigate } from '@tanstack/react-router';
import { authClient, useAuthSession } from '../../users/auth/auth-client';
import { Button } from '../../ui/button/Button';
import { cn } from '@task-manager/utils';

export const Navbar = (props: React.HTMLAttributes<HTMLElement>) => {
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
    <nav
      {...props}
      className={cn('max-w-[1280px] mx-auto px-4 md:px-8', props.className)}
    >
      <ul className={'flex justify-between items-center list-none'}>
        <li>
          <Link to='/'>Home</Link>
        </li>
        {isLoggedIn ? (
          <div className={'flex items-center gap-2.5'}>
            <li>
              <Link to='/profile'>Profile</Link>
            </li>
            <li>
              <Button onClick={handleSignout}>Logout</Button>
            </li>
          </div>
        ) : (
          <li className={'flex items-center gap-2.5'}>
            <Link to='/auth/login'>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
