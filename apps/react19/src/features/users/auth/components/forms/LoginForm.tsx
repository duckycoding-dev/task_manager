import { useAuthDispatch } from '../../hooks/useAuth';
import { Link, useNavigate } from '@tanstack/react-router';
import classes from './form.module.css';
import { authClient } from '../../auth-client';

export const LoginForm = () => {
  const dispatchAuthAction = useAuthDispatch();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Here you would typically handle the login logic, e.g., call an API
    dispatchAuthAction({
      type: 'SIGN_IN',
      payload: { userEmail: email },
    });

    authClient.signIn.email({
      email: 'test@user.com',
      password: 'password1234',
    });
    return navigate({ to: '/' });
  };

  // const response = await auth.api.signInEmail({
  //   body: {
  //     email,
  //     password,
  //   },
  //   asResponse: true, // returns a response object instead of data
  // });

  return (
    <>
      <form onSubmit={handleSubmit} className={classes['auth-form']}>
        <h1 className={classes['title']}>Login</h1>
        <div className={classes['field']}>
          <label htmlFor='email'>Email:</label>
          <input type='email' id='email' name='email' required />
        </div>
        <div className={classes['field']}>
          <label htmlFor='password'>Password:</label>
          <input type='password' id='password' name='password' required />
        </div>
        <button type='submit'>Login</button>
        <p>
          Don't have an account? <Link to='/auth/signup'>Sign up</Link>
        </p>
      </form>
    </>
  );
};
