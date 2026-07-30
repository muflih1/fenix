import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { trpc } from '../utils/trpc';
import { Building2, Plus } from 'lucide-react';

const newCompanySchema = z.object({
  name: z.string().min(1, 'Company / Corporate name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
});

type NewCompanyFormData = z.infer<typeof newCompanySchema>;

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCompany: { id: string; name: string; phone?: string; email?: string; address?: string }) => void;
}

export function NewCompanyModal({ isOpen, onClose, onSuccess }: NewCompanyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewCompanyFormData>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.companies.create.useMutation({
    onSuccess: (created) => {
      utils.companies.list.invalidate();
      onSuccess(created);
      onClose();
      reset();
    }
  });

  const onSubmit = (data: NewCompanyFormData) => {
    createMutation.mutate({
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || undefined,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Company"
      description="Add a new company to the normalized database with Zod validation."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#09090b] p-4 space-y-3 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
            <Building2 className="h-4 w-4" /> Corporate Entity Details
          </h4>

          <Input
            label="Company / Corporate Name *"
            error={errors.name?.message}
            {...register('name')}
            placeholder="e.g. Apex Lounge & Bar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Corporate Phone"
              error={errors.phone?.message}
              {...register('phone')}
              placeholder="+1 (555) 234-5678"
            />
            <Input
              label="Corporate Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
              placeholder="contact@company.com"
            />
          </div>

          <Input
            label="Corporate Address"
            error={errors.address?.message}
            {...register('address')}
            placeholder="742 Evergreen Terrace, Suite 4B"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating Company...' : 'Save & Select Company'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
