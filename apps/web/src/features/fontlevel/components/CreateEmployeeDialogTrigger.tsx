import {IconPlusFilled} from '@tabler/icons-react';
import {Button} from '../../../components/Button';
import {DialogRoot, DialogTrigger} from '../../../components/Dialog';
import {CreateEmployeeDialog} from './CreateEmployeeDialog';

export function CreateEmployeeDialogTrigger() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button />}>
        <IconPlusFilled size={20} /> Add employee
      </DialogTrigger>
      <CreateEmployeeDialog />
    </DialogRoot>
  );
}
