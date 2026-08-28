import {createFileRoute} from '@tanstack/react-router';
import {Button} from '../components/Button';
import {DialogTrigger} from '../components/Dialog';
import {CreateCustomerDialog} from '../components/CreateCustomerDialog';
import {useState} from 'react';
import { CreateJobDialog } from '../components/CreateJobDialog';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [isOpen, setOpen] = useState(false);
  return (
    <div>
      <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <Button>Create customer</Button>
        <CreateCustomerDialog onClose={() => setOpen(false)} />
      </DialogTrigger>
      <DialogTrigger>
        <Button>Create job</Button>
        <CreateJobDialog />
      </DialogTrigger>
    </div>
  );
}
