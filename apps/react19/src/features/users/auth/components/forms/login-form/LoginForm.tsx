import { Link, useNavigate } from '@tanstack/react-router';
import classes from './login-form.module.css';
import { authClient } from '../../../auth-client';
import { Button } from '../../../../../ui/button/Button';
import { InputWithLabel } from '../../../../../ui/form/input-with-label/InputWithLabel';

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
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
    <form onSubmit={handleSubmit} className={classes['auth-form']}>
      <InputWithLabel
        inputId='email'
        inputName='email'
        label='Email:'
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
        Don't have an account? <Link to='/auth/signup'>Sign up</Link>
      </p>
    </form>
  );
};
