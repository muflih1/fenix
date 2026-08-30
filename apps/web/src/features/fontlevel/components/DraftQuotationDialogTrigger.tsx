import {useState} from 'react';
import {DialogRoot, DialogTrigger} from '../../../components/Dialog';
import {Button} from '../../../components/Button';
import {CreateJobDialog} from '../../../components/CreateJobDialog';

export function DraftQuotationDialogTrigger() {
  const [isOpen, setOpen] = useState(false);

  return (
    <DialogRoot open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create quotation</DialogTrigger>
      <CreateJobDialog
        onSuccess={() => {
          setOpen(false);
        }}
      />
    </DialogRoot>
  );
}
