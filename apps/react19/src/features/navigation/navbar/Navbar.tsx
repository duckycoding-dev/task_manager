import { useAuthSession } from '../../users/auth/auth-client';
import { cn } from '@task-manager/utils';
import { NavigationProfileDropdownMenu } from '../navigation-profile-dropdown-menu/NavigationProfileDropdownMenu';
import { StyledLink } from '../../ui/link/Link';

export const Navbar = (props: React.HTMLAttributes<HTMLElement>) => {
  const { data: authData } = useAuthSession();

  const isLoggedIn = !!authData?.user;

  return (
    <nav
      {...props}
      className={cn('max-w-[1280px] mx-auto px-4 md:px-8', props.className)}
    >
      <ul className={'flex justify-between items-center list-none'}>
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
