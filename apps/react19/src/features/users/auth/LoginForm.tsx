import { useAuthDispatch } from './hooks/useAuth';

export const LoginForm = () => {
  const dispatchAuthAction = useAuthDispatch();

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
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='email'>Email:</label>
        <input type='email' id='email' name='email' required />
      </div>
      <div>
        <label htmlFor='password'>Password:</label>
        <input type='password' id='password' name='password' required />
      </div>
      <button type='submit'>Login</button>
    </form>
  );
};
