import {useForm} from 'react-hook-form';
import {Dialog, DialogHeader} from './Dialog';
import {SelectItem} from './Select';
import {HookFormSelectField} from './HookFormSelectField';
import {HookFormTextAreaField} from './HookFormTextAreaField';
import {Button} from './Button';

export function CreateJobDialog() {
  const form = useForm({
    defaultValues: {
      customer: '',
      title: '',
      priority: 'NORMAL',
    },
  });

  return (
    <Dialog>
      <DialogHeader title='Create job' />
      <form onSubmit={form.handleSubmit(() => {})}>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='p-4 flex flex-col'>
            <HookFormSelectField
              control={form.control}
              name='customer'
              label='Client'
              placeholder='Client'
            >
              <SelectItem id='shibili'>Shibili</SelectItem>
            </HookFormSelectField>
            <HookFormTextAreaField
              control={form.control}
              name='title'
              label='Job details'
            />
            <HookFormSelectField
              control={form.control}
              name='priority'
              label='Priority'
              placeholder='Priority'
            >
              <SelectItem id='NORMAL'>Normal</SelectItem>
              <SelectItem id='URGENT'>Urgent</SelectItem>
            </HookFormSelectField>
          </div>
          <div className='p-4 flex items-center justify-end gap-2'>
            <Button type='button' variant='secondary' slot='close'>
              Cancel
            </Button>
            <Button type='submit' padding='wide'>
              Create
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
