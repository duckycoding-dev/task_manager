import { Link } from '@tanstack/react-router';
import classes from './form.module.css';

export const SignupForm = () => {
  return (
    <form className={classes['auth-form']}>
      <h1 className={classes['title']}>Signup</h1>
      <div className={classes['field']}>
        <label htmlFor='username'>Username:</label>
        <input type='text' id='username' name='username' required />
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
