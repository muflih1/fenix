import {Dialog, DialogConfirmationFooter, DialogHeader} from './Dialog';
import {FormTextInputField} from './FormTextInputField';
import {useTRPC} from '../utils/trpc';
import {useMutation} from '@tanstack/react-query';
import z from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, useFormRef} from './Form';
import type {inferOutput} from '@trpc/tanstack-react-query';

const schema = z.object({
  name: z.string().nonempty(),
  phone: z.string().nonempty().min(10),
  email: z.email().or(z.literal('')),
  companyName: z.string().optional(),
});

type CreateCustomerFormData = z.infer<typeof schema>;

export function CreateCustomerDialog({
  onSuccess,
}: {
  onSuccess?: (
    data: inferOutput<ReturnType<typeof useTRPC>['customers']['create']>,
  ) => void;
}) {
  const trpc = useTRPC();
  const formRef = useFormRef<CreateCustomerFormData>(null);
  const {mutate: createCustomerSync} = useMutation(
    trpc.customers.create.mutationOptions({}),
  );

  return (
    <Dialog>
      <DialogHeader text='Create customer' />
      <Form<CreateCustomerFormData>
        defaultValues={{
          name: '',
          phone: '',
          email: '',
          companyName: '',
        }}
        ref={formRef}
        resolver={zodResolver(schema)}
        onSubmit={values => {
          createCustomerSync(values, {
            onSuccess: data => {
              onSuccess?.(data);
              formRef.current?.reset();
            },
          });
        }}
      >
        {form => (
          <div className='min-h-0 flex-1 overflow-y-auto flex flex-col'>
            <div className='space-y-3 p-4 flex flex-col'>
              <FormTextInputField
                autoFocus
                control={form.control}
                name='name'
                label='Name'
              />
              <FormTextInputField
                control={form.control}
                name='phone'
                label='Phone number'
              />
              <FormTextInputField
                control={form.control}
                name='email'
                label='Email address (optional)'
              />
              <FormTextInputField
                control={form.control}
                name='companyName'
                label='Company name (optional)'
              />
            </div>
            <DialogConfirmationFooter
              primary={{
                type: 'submit',
                label: 'Save',
              }}
              secondary={{
                label: 'Cancel',
              }}
            />
          </div>
        )}
      </Form>
    </Dialog>
  );
}
