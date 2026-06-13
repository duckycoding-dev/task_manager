import { useNavigate } from '@tanstack/react-router';

import { authClient } from '../../../lib/auth-client';
import { StyledLink } from '../../ui/link/Link';

export function NavigationProfileDropdownMenu() {
  const navigate = useNavigate();
  const handleSignout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void navigate({ to: '/auth/login' });
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
      <ul className='dropdown-content menu bg-base-200 rounded-box flex w-max flex-col gap-1 p-2 shadow-sm [&_a]:no-underline'>
        <li>
          <StyledLink to='/profile'>Profile</StyledLink>
        </li>
        <li>
          <button
            type='button'
            className={'btn-ghost text-error m-0 text-left'}
            onClick={handleSignout}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
