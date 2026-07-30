import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { NewCompanyModal } from './NewCompanyModal';
import { trpc } from '../utils/trpc';
import { Plus, Building2 } from 'lucide-react';

const newQuotationSchema = z.object({
  companyId: z.string().optional(),
  companyName: z.string().min(1, 'Client or company name is required'),
  customerName: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(5, 'Contact phone is required'),
  siteAddress: z.string().min(3, 'Installation location is required'),
  signType: z.enum([
    '3D_ACRYLIC_CHANNEL_LETTERS',
    'NEON_FLEX',
    'LED_LIGHTBOX',
    'P10_OUTDOOR_MATRIX',
    'PYLON_SIGN',
    'VINYL_GRAPHICS'
  ]),
  totalQuoteAmount: z.number({ invalid_type_error: 'Quote amount is required' }).positive('Quote amount must be greater than 0'),
});

type NewQuotationFormData = z.infer<typeof newQuotationSchema>;

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewJobModal({ isOpen, onClose, onSuccess }: NewJobModalProps) {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<NewQuotationFormData>({
    resolver: zodResolver(newQuotationSchema),
    defaultValues: {
      companyId: '',
      companyName: '',
      customerName: '',
      phone: '',
      siteAddress: '',
      signType: '3D_ACRYLIC_CHANNEL_LETTERS',
      totalQuoteAmount: 45000,
    }
  });

  const { data: companies = [] } = trpc.companies.list.useQuery(
    {},
    { enabled: isOpen }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.companies.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
      reset();
      onClose();
      if (onSuccess) onSuccess();
    }
  });

  const watchCompanyId = watch('companyId');
  const watchCompanyName = watch('companyName');

  const handleCompanySelectChange = (e: { target: { value: string } }) => {
    const val = e.target.value;

    if (val === 'CREATE_NEW') {
      setIsCompanyModalOpen(true);
      return;
    }

    const matched = companies.find((c: any) => c.id === val || c.name === val);
    if (matched) {
      setValue('companyId', matched.id);
      setValue('companyName', matched.name);
      if (matched.phone) setValue('phone', matched.phone);
      if (matched.address) setValue('siteAddress', matched.address);
    } else {
      setValue('companyId', '');
      setValue('companyName', val);
    }
  };

  const handleCompanyCreated = (newComp: { id: string; name: string; phone?: string; email?: string; address?: string }) => {
    setValue('companyId', newComp.id);
    setValue('companyName', newComp.name);
    if (newComp.phone) setValue('phone', newComp.phone);
    if (newComp.address) setValue('siteAddress', newComp.address);
  };

  const onSubmit = (data: NewQuotationFormData) => {
    const estMaterial = Math.round(data.totalQuoteAmount * 0.35);
    const labor = Math.round(data.totalQuoteAmount * 0.35);
    const overhead = Math.round(data.totalQuoteAmount * 0.10);

    createMutation.mutate({
      title: `${data.companyName || data.customerName} - ${data.signType.replace(/_/g, ' ')}`,
      customerName: data.customerName,
      companyName: data.companyName || '',
      phone: data.phone,
      email: '',
      signType: data.signType,
      dimensions: {
        width: 0,
        height: 0,
        unit: 'ft'
      },
      installationType: 'OUTDOOR_FACADE',
      siteAddress: data.siteAddress,
      priority: 'NORMAL',
      notes: '',
      stage: 'QUOTATION',
      financials: {
        estimatedMaterialCost: estMaterial,
        laborCost: labor,
        overheadCost: overhead,
        markupPercent: 20,
        totalQuoteAmount: Number(data.totalQuoteAmount),
        depositPaid: 0,
        finalBalancePaid: 0,
        paymentStatus: 'PENDING_DEPOSIT'
      }
    });
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !isCompanyModalOpen}
        onClose={onClose}
        title="Create New Quotation"
        description="Enter bare minimum client & signage details to issue a quote. (Site dimensions will be measured during site survey)"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client Info */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#09090b] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Client Details
              </h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsCompanyModalOpen(true)}
                icon={<Plus className="h-3.5 w-3.5 text-amber-600 dark:text-yellow-400" />}
              >
                + New Company
              </Button>
            </div>

            <Select
              label="Company / Storefront Name *"
              value={watchCompanyId || watchCompanyName}
              onChange={handleCompanySelectChange}
              options={[
                { label: '-- Select Existing Company --', value: '' },
                ...companies.map((c: any) => ({
                  label: `${c.name} (${c.phone || 'No phone'})`,
                  value: c.id
                })),
                { label: '✨ + Create New Company...', value: 'CREATE_NEW' }
              ]}
            />
            {errors.companyName && (
              <p className="text-xs text-rose-500 font-medium">{errors.companyName.message}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Contact Person Name *"
                error={errors.customerName?.message}
                {...register('customerName')}
                placeholder="e.g. Alex Rivera"
              />
              <Input
                label="Contact Phone *"
                error={errors.phone?.message}
                {...register('phone')}
                placeholder="+91 98765 00000"
              />
            </div>

            <Input
              label="Installation Site Address *"
              error={errors.siteAddress?.message}
              {...register('siteAddress')}
              placeholder="e.g. 742 Evergreen Terrace, Downtown"
            />
          </div>

          {/* Signage Details & Financial Quote */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#09090b] p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">Sign Type & Estimated Quote</h4>

            <Select
              label="Signage Type *"
              options={[
                { label: '3D Acrylic Channel Letters', value: '3D_ACRYLIC_CHANNEL_LETTERS' },
                { label: 'Silicone Neon Flex', value: 'NEON_FLEX' },
                { label: 'LED Lightbox Menu Board', value: 'LED_LIGHTBOX' },
                { label: 'P10 Outdoor LED Matrix', value: 'P10_OUTDOOR_MATRIX' },
                { label: 'Pylon Sign Structure', value: 'PYLON_SIGN' },
                { label: 'Vinyl Cut & Flex Banner', value: 'VINYL_GRAPHICS' },
              ]}
              {...register('signType')}
            />

            <Input
              label="Total Quotation Amount (₹) *"
              type="number"
              error={errors.totalQuoteAmount?.message}
              {...register('totalQuoteAmount', { valueAsNumber: true })}
              placeholder="e.g. 45000"
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
              {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </Dialog>

      <NewCompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </>
  );
}
