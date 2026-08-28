import {useForm} from 'react-hook-form';
import {Dialog, DialogHeader} from './Dialog';
import {SelectItem} from './Select';
import {HookFormSelectField} from './HookFormSelectField';
import {HookFormTextAreaField} from './HookFormTextAreaField';
import {Button} from './Button';
import {IconPlusFilled} from '@tabler/icons-react';
import {DialogTrigger, Button as Pressable} from 'react-aria-components';
import {CreateCustomerDialog} from './CreateCustomerDialog';
import {useState} from 'react';

export function CreateJobDialog() {
  const form = useForm({
    defaultValues: {
      customer: '',
      title: '',
      priority: 'NORMAL',
    },
  });
  const [isSelectOpen, setSelectOpen] = useState(false);

  return (
    <Dialog>
      <DialogHeader title='Create job' />
      <form onSubmit={form.handleSubmit(() => {})}>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <div className='p-4 flex flex-col'>
            <HookFormSelectField
              isOpen={isSelectOpen}
              onOpenChange={setSelectOpen}
              control={form.control}
              name='customer'
              label='Client'
              placeholder='Client'
              addOnEnd={
                <div className='p-1 flex flex-col min-h-0 shrink-0 border-t border-t-gray-200'>
                  <DialogTrigger>
                    <Pressable
                      excludeFromTabOrder
                      type='button'
                      slot='close'
                      className='px-2 py-1.5 flex items-center select-none touch-manipulation gap-2 rounded-xl bg-transparent hover:bg-black/5 cursor-pointer font-medium text-sm text-center justify-center [-webkit-tap-highlight-color:transparent] outline-none data-focus-visible:shadow-(--focus-ring-shadow-default)'
                      onPress={() => setSelectOpen(false)}
                    >
                      <IconPlusFilled size={20} />
                      Add customer
                    </Pressable>
                    <CreateCustomerDialog onClose={() => {}} />
                  </DialogTrigger>
                </div>
              }
            >
              <SelectItem id='1'>Shibili</SelectItem>
              <SelectItem id='2'>Haidar</SelectItem>
              <SelectItem id='3'>Minavir</SelectItem>
              <SelectItem id='4'>Nazim</SelectItem>
              <SelectItem id='5'>Abrar</SelectItem>
              <SelectItem id='6'>Afnan</SelectItem>
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
