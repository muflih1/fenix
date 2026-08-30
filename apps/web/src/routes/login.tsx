import {createFileRoute} from '@tanstack/react-router';
import {useForm} from 'react-hook-form';
import {FormTextInputField} from '../components/FormTextInputField';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '../components/Button';
import {useMutation} from '@tanstack/react-query';
import {AuthApi} from '../api';
import {pushErrorToast} from '../components/Toast';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

const schema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty({error: 'Please fill out this field.'}),
});

type LoginFormData = z.infer<typeof schema>;

function LoginPage() {
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(schema),
  });

  const {mutate: loginSync, isPending} = useLoginMutation();

  return (
    <div className='min-h-screen h-full flex items-center justify-center relative'>
      <div className='max-w-100 w-full p-4 mx-auto overflow-hidden space-y-4'>
        <h2 className='text-lg font-bold text-center'>Sign in</h2>
        <form
          onSubmit={form.handleSubmit(data => {
            loginSync(data, {
              onError: error => {
                pushErrorToast({message: error.message});
              },
            });
          })}
          className='space-y-1.5'
        >
          <FormTextInputField
            autoFocus
            disabled={isPending}
            control={form.control}
            name='email'
            label='Email'
            type='email'
          />
          <FormTextInputField
            disabled={isPending}
            control={form.control}
            name='password'
            label='Password'
            type='password'
          />
          <Button type='submit' className='w-full mt-4'>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

function useLoginMutation() {
  return useMutation({
    mutationFn: (input: AuthApi.LoginParams) => AuthApi.login(input),
  });
}
