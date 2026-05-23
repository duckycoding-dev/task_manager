import { cn } from '@task-manager/utils';

import { useAuthSession } from '../../../lib/auth-client';
import { StyledLink } from '../../ui/link/Link';
import { NavigationProfileDropdownMenu } from '../navigation-profile-dropdown-menu/NavigationProfileDropdownMenu';

export const Navbar = (props: React.HTMLAttributes<HTMLElement>) => {
  const { data: authData } = useAuthSession();

  const isLoggedIn = !!authData?.user;

  return (
    <nav
      {...props}
      className={cn('mx-auto max-w-[1280px] px-4 md:px-8', props.className)}
    >
      <ul className={'flex list-none items-center justify-between'}>
        <li>
          <StyledLink className='link' to='/'>
            Home
          </StyledLink>
        </li>
        {isLoggedIn ? (
          <li>
            <NavigationProfileDropdownMenu />
          </li>
        ) : (
          <li className={'flex items-center gap-2.5'}>
            <StyledLink className='link-secondary' to='/auth/login'>
              Login
            </StyledLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
