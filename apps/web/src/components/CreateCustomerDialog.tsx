import {useForm} from 'react-hook-form';
import {Button} from './Button';
import {Dialog, DialogHeader} from './Dialog';
import {HookFormTextInputField} from './HookFormTextInputField';
import {useTRPC} from '../utils/trpc';
import {useMutation} from '@tanstack/react-query';

export function CreateCustomerDialog({
  onClose,
  onSuccess,
}: {
  onClose(): void;
  onSuccess?: () => void;
}) {
  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      companyName: '',
    },
  });
  const trpc = useTRPC();
  const {mutate: createCustomerSync} = useMutation(
    trpc.customers.create.mutationOptions({
      onSuccess: () => {
        onSuccess?.();
        onClose();
        form.reset();
      },
    }),
  );

  return (
    <Dialog>
      <DialogHeader title='Create customer' />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <form
          onSubmit={form.handleSubmit(values => {
            createCustomerSync(values);
          })}
          className='space-y-3 p-4 flex flex-col'
        >
          <HookFormTextInputField control={form.control} name='name' label='Name' />
          <HookFormTextInputField
            control={form.control}
            name='phone'
            label='Phone number'
          />
          <HookFormTextInputField
            control={form.control}
            name='email'
            label='Email address (optional)'
          />
          <HookFormTextInputField
            control={form.control}
            name='companyName'
            label='Company name (optional)'
          />
          <div className='flex justify-end items-center space-x-2'>
            <Button slot='close' variant='secondary'>
              Cancel
            </Button>
            <Button type='submit' padding='wide'>
              Create
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
