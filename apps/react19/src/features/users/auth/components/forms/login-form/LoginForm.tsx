import { useNavigate } from '@tanstack/react-router';
import { cn } from '@task-manager/utils';
import { authClient } from '../../../auth-client';
import { Button } from '../../../../../ui/button/Button';
import { InputWithLabel } from '../../../../../ui/form/input-with-label/InputWithLabel';
import { StyledLink } from '../../../../../ui/link/Link';

interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export const LoginForm = ({
  redirectTo,
  className,
  ...props
}: LoginFormProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          if (redirectTo) {
            return navigate({ to: redirectTo });
          }
          return;
        },
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'max-w-[400px] mx-auto flex flex-col gap-4 w-full',
        className,
      )}
      {...props}
    >
      <InputWithLabel
        inputId='email'
        inputName='email'
        label='Email:'
        type='email'
        required
      />
      <InputWithLabel
        inputId='password'
        inputName='password'
        label='Password:'
        type='password'
        required
      />
      <Button type='submit'>Login</Button>
      <p>
        Don't have an account?{' '}
        <StyledLink to='/auth/signup' className='text-secondary'>
          Sign up
        </StyledLink>
      </p>
    </form>
  );
};
