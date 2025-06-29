import { Link } from '@tanstack/react-router';
import { cn } from '@task-manager/utils';
import { authClient } from '../../../auth-client';
import { Button } from '../../../../../ui/button/Button';
import { InputWithLabel } from '../../../../../ui/form/input-with-label/InputWithLabel';
import { useMutation } from '@tanstack/react-query';
import { FormError } from '../../../../../ui/form/form-error/FormError';

const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const repeatPassword = formData.get('repeatPassword') as string;
  const name = formData.get('name') as string;

  if (password !== repeatPassword) {
    throw new Error('Passwords do not match. Please try again.');
  }

  const { data, error } = await authClient.signUp.email({
    name,
    email,
    password,
  });

  if (error || !data) {
    throw error || new Error('Signup failed. Please try again later.');
  }
  return data;
};

interface SignupFormProps extends React.HTMLAttributes<HTMLFormElement> {
  onSuccess: () => void;
}

export const SignupForm = ({
  onSuccess,
  className,
  ...props
}: SignupFormProps) => {
  const {
    mutate: signup,
    error,
    isPending: submitIsPending,
  } = useMutation({
    mutationKey: ['signup'],
    mutationFn: handleSignup,

    onSuccess: () => {
      console.log('SUCCESS');
      return onSuccess();
    },
  });

  console.log('signupIsPending', submitIsPending);

  return (
    <form
      onSubmit={signup}
      className={cn('flex flex-col gap-4 w-full', className)}
      {...props}
    >
      <InputWithLabel
        inputId='name'
        inputName='name'
        type='text'
        label='Name:'
        required
      />
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
      <InputWithLabel
        inputId='repeatPassword'
        inputName='repeatPassword'
        label='Repeat password:'
        type='password'
        required
      />
      <Button type='submit' disabled={submitIsPending}>
        {submitIsPending ? 'Signing up...' : 'Signup'}
      </Button>
      {error && <FormError>{error.message}</FormError>}
      <p>
        Already have an account? <Link to='/auth/login'>Login</Link>
      </p>
    </form>
  );
};
