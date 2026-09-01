import {useForm} from 'react-hook-form';
import {
  Dialog,
  DialogConfirmationFooter,
  DialogHeader,
} from '../../../components/Dialog';
import {FormTextInputField} from '../../../components/FormTextInputField';
import {FormSelectField} from '../../../components/FormSelectField';
import {SelectItem} from '../../../components/Select';

export function CreateEmployeeDialog() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '',
    },
  });

  return (
    <Dialog>
      <DialogHeader text='Create employee' />
      <form onSubmit={form.handleSubmit(() => {})}>
        <div className='flex flex-col min-h-0'>
          <div className='min-h-0 flex flex-col grow shrink overflow-y-auto p-4'>
            <FormTextInputField
              autoFocus
              control={form.control}
              name='name'
              label='Name'
            />
            <FormTextInputField
              control={form.control}
              name='email'
              label='Email ID'
            />
            <FormTextInputField
              control={form.control}
              name='password'
              label='Password'
            />
            <FormSelectField
              control={form.control}
              name='role'
              label='Role'
              items={roles}
            >
              {roles.map(r => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
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

const roles = [
  {value: 'DESIGNER', label: 'Designer'},
  {value: 'FRONT_LEVEL', label: 'Front Level'},
  {value: 'SUPERVISOR', label: 'Supervisor'},
  {value: 'TECHNISION', label: 'Technision'},
];
