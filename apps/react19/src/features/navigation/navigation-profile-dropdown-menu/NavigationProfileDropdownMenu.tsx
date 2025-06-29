import { useNavigate } from '@tanstack/react-router';
import { authClient } from '../../users/auth/auth-client';
import { StyledLink } from '../../ui/link/Link';

export function NavigationProfileDropdownMenu() {
  const navigate = useNavigate();
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
    <div className='dropdown dropdown-end'>
      <button
        tabIndex={0}
        type='button'
        className='btn btn-ghost btn-circle m-1'
      >
        🧑
      </button>
      <ul className='flex flex-col gap-1 dropdown-content menu bg-base-200 rounded-box p-2 shadow-sm w-max [&_a]:no-underline'>
        <li>
          <StyledLink to='/profile'>Profile</StyledLink>
        </li>
        <li>
          <button
            type='button'
            className={'btn-ghost text-error text-left m-0'}
            onClick={handleSignout}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
