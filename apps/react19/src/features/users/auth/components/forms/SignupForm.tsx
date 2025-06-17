import { Link } from '@tanstack/react-router';
import classes from './form.module.css';
import { authClient } from '../../auth-client';

const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const repeatPassword = formData.get('repeatPassword') as string;
  const name = formData.get('name') as string;

  if (password !== repeatPassword) {
    alert("Passwords don't match");
    return;
  }

  const { data, error } = await authClient.signUp.email({
    name,
    email,
    password,
  });
  console.log('Signup response:', { data, error });

  // Redirect or show success message
};

export const SignupForm = () => {
  return (
    <form className={classes['auth-form']} onSubmit={handleSignup}>
      <h1 className={classes['title']}>Signup</h1>
      <div className={classes['field']}>
        <label htmlFor='name'>Name:</label>
        <input type='text' id='name' name='name' required />
      </div>
      <div className={classes['field']}>
        <label htmlFor='email'>Email:</label>
        <input type='email' id='email' name='email' required />
      </div>
      <div className={classes['field']}>
        <label htmlFor='password'>Password:</label>
        <input type='password' id='password' name='password' required />
      </div>
      <div className={classes['field']}>
        <label htmlFor='repeatPassword'>Repeat password:</label>
        <input
          type='password'
          id='repeatPassword'
          name='repeatPassword'
          required
        />
      </div>
      <button type='submit'>Signup</button>
      <p>
        Already have an account? <Link to='/auth/login'>Login</Link>
      </p>
    </form>
  );
};
