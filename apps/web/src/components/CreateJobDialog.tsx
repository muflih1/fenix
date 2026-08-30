import {
  Dialog,
  DialogConfirmationFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from './Dialog';
import {SelectItem} from './Select';
import {FormSelectField} from './FormSelectField';
import {FormTextAreaField} from './FormTextAreaField';
import {IconCheckFilled, IconPlusFilled} from '@tabler/icons-react';
import {CreateCustomerDialog} from './CreateCustomerDialog';
import {useState} from 'react';
import {FormTextInputField} from './FormTextInputField';
import {LoadingDialog} from './LoadingDialog';
import {useTRPC} from '../utils/trpc';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {inferOutput} from '@trpc/tanstack-react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {pushSimpleToast} from './Toast';

const createJobSchema = z.object({
  customerId: z.string().min(1),
  title: z
    .string()
    .min(1)
    .refine(data => data.trim() !== '', {error: 'Cannot be empty'}),
  quoteAmount: z.string().nonempty(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'IMMEDIATE']),
  location: z.string(),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

export function CreateJobDialog({
  onSuccess,
}: {
  onSuccess?: (
    data: inferOutput<ReturnType<typeof useTRPC>['jobs']['create']>,
  ) => void;
}) {
  const [isSelectOpen, setSelectOpen] = useState(false);
  const [isCreateCustomerDialogOpen, setCreateCustomerDialogOpen] =
    useState(false);
  const form = useForm<CreateJobFormData>({
    defaultValues: {
      customerId: '',
      title: '',
      priority: 'NORMAL',
      quoteAmount: '',
      location: '',
    },
    resolver: zodResolver(createJobSchema),
  });
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const {data: customers, isLoading} = useQuery(
    trpc.customers.list.queryOptions(),
  );
  const {mutate: createJobMutationSync} = useMutation(
    trpc.jobs.create.mutationOptions(),
  );

  return isLoading ? (
    <LoadingDialog />
  ) : (
    <Dialog>
      <DialogHeader text='Draft Quotation' />
      <form
        onSubmit={form.handleSubmit(data => {
          createJobMutationSync(data, {
            onSuccess: data => {
              onSuccess?.(data);
              form.reset();
              pushSimpleToast({
                icon: (
                  <IconCheckFilled
                    size={20}
                    className='bg-(--positive) text-white rounded-full'
                  />
                ),
                message: 'Quotation created successfully.',
              });
            },
          });
        })}
      >
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='p-4 flex flex-col'>
            <FormSelectField
              autoFocus
              open={isSelectOpen}
              onOpenChange={setSelectOpen}
              control={form.control}
              items={customers?.map(c => ({value: c.id, label: c.name})) ?? []}
              name='customerId'
              label='Client'
              placeholder='Client'
              addOnEnd={
                <div className='p-1 flex flex-col min-h-0 shrink-0 border-t border-t-gray-200'>
                  <DialogRoot
                    open={isCreateCustomerDialogOpen}
                    onOpenChange={setCreateCustomerDialogOpen}
                  >
                    <DialogTrigger
                      render={
                        <button
                          tabIndex={-1}
                          type='button'
                          className='px-2 py-1.5 flex items-center select-none touch-manipulation gap-2 rounded-xl bg-transparent hover:bg-black/5 cursor-pointer font-medium text-sm text-center justify-center [-webkit-tap-highlight-color:transparent] outline-none data-focus-visible:shadow-(--focus-ring-shadow-default)'
                          onClick={() => {
                            setCreateCustomerDialogOpen(true);
                            setSelectOpen(false);
                          }}
                        >
                          <IconPlusFilled size={20} />
                          Add customer
                        </button>
                      }
                    />
                    <CreateCustomerDialog
                      onSuccess={data => {
                        queryClient.refetchQueries(
                          trpc.customers.list.queryOptions(),
                        );
                        form.setValue('customerId', data?.id ?? '');
                        setCreateCustomerDialogOpen(false);
                      }}
                    />
                  </DialogRoot>
                </div>
              }
            >
              {customers?.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  <div className='flex flex-col w-full'>
                    <span className='text-sm text-primary whitespace-nowrap'>
                      {c.name}
                    </span>
                    <span className='text-xs text-secondary-foreground whitespace-nowrap font-normal'>
                      +91 {c.phone}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </FormSelectField>
            <FormTextAreaField
              control={form.control}
              name='title'
              label='Signage details'
              placeholder='e.g. Acrylic Logo'
              className='min-h-9'
            />
            <FormTextInputField
              control={form.control}
              name='quoteAmount'
              label='Quote estimate'
              numeric
            />
            <FormTextAreaField
              control={form.control}
              name='location'
              label='Installation location'
              placeholder='e.g. Near Shoprix.'
            />
            <FormSelectField
              control={form.control}
              name='priority'
              label='Priority'
              placeholder='Priority'
              items={jobPriorities}
            >
              {jobPriorities.map(jp => (
                <SelectItem key={jp.value} value={jp.value}>
                  {jp.label}
                </SelectItem>
              ))}
            </FormSelectField>
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
      </form>
    </Dialog>
  );
}

const jobPriorities = [
  {value: 'LOW', label: 'Low'},
  {value: 'NORMAL', label: 'Normal'},
  {value: 'HIGH', label: 'High'},
  {value: 'IMMEDIATE', label: 'Urgent'},
];
