import {IconLoader} from '@tabler/icons-react';
import {Dialog} from './Dialog';

export function LoadingDialog() {
  return (
    <Dialog className='py-18 px-4 flex items-center justify-center'>
      <IconLoader size={24} className='animate-spin' />
    </Dialog>
  );
}
