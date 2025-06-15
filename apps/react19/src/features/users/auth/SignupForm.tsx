export const SignupForm = () => {
  return (
    <form>
      <div>
        <label htmlFor='username'>Username:</label>
        <input type='text' id='username' name='username' required />
      </div>
      <div>
        <label htmlFor='password'>Password:</label>
        <input type='password' id='password' name='password' required />
      </div>
      <div>
        <label htmlFor='repeatPassword'>Repeat password:</label>
        <input
          type='password'
          id='repeatPassword'
          name='repeatPassword'
          required
        />
      </div>
      <button type='submit'>Signup</button>
    </form>
  );
};
