import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { trpc } from '../utils/trpc';
import { Package } from 'lucide-react';

const stockItemSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1, 'Material name is required'),
  category: z.enum([
    'LED_MODULES',
    'POWER_SUPPLIES',
    'ACRYLIC_SHEETS',
    'ALUMINUM_PROFILES',
    'VINYL_FLEX',
    'CONTROLLERS',
    'FASTENERS'
  ]),
  stockQuantity: z.number({ invalid_type_error: 'Stock quantity is required' }).min(0, 'Quantity cannot be negative'),
  minReorderLevel: z.number().min(0),
  unit: z.string().min(1, 'Unit is required'),
  unitCostPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  supplier: z.string().optional(),
  binLocation: z.string().optional(),
  notes: z.string().optional()
});

type StockItemFormData = z.infer<typeof stockItemSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: any;
}

export function StockAdjustmentModal({ isOpen, onClose, targetItem }: StockAdjustmentModalProps) {
  const isEditing = !!targetItem;
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      sku: targetItem?.sku || '',
      name: targetItem?.name || '',
      category: targetItem?.category || 'LED_MODULES',
      stockQuantity: targetItem?.stockQuantity ?? 100,
      minReorderLevel: targetItem?.minReorderLevel ?? 20,
      unit: targetItem?.unit || 'pcs',
      unitCostPrice: targetItem?.unitCostPrice ?? 1.50,
      sellingPrice: targetItem?.sellingPrice ?? 3.00,
      supplier: targetItem?.supplier || '',
      binLocation: targetItem?.binLocation || 'Rack A-01',
      notes: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        sku: targetItem?.sku || '',
        name: targetItem?.name || '',
        category: targetItem?.category || 'LED_MODULES',
        stockQuantity: targetItem?.stockQuantity ?? 100,
        minReorderLevel: targetItem?.minReorderLevel ?? 20,
        unit: targetItem?.unit || 'pcs',
        unitCostPrice: targetItem?.unitCostPrice ?? 1.50,
        sellingPrice: targetItem?.sellingPrice ?? 3.00,
        supplier: targetItem?.supplier || '',
        binLocation: targetItem?.binLocation || 'Rack A-01',
        notes: ''
      });
    }
  }, [isOpen, targetItem, reset]);

  const createMutation = trpc.inventory.create.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
      onClose();
    }
  });

  const updateStockMutation = trpc.inventory.updateStock.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
      onClose();
    }
  });

  const onSubmit = (data: StockItemFormData) => {
    if (isEditing) {
      updateStockMutation.mutate({
        id: targetItem.id,
        stockQuantity: Number(data.stockQuantity),
        notes: data.notes
      });
    } else {
      createMutation.mutate({
        sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
        name: data.name,
        category: data.category,
        stockQuantity: Number(data.stockQuantity),
        minReorderLevel: Number(data.minReorderLevel),
        unit: data.unit,
        unitCostPrice: Number(data.unitCostPrice),
        sellingPrice: Number(data.sellingPrice),
        supplier: data.supplier || 'General Sign Supplier',
        binLocation: data.binLocation || 'Rack A-01'
      });
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Adjust Stock - ${targetItem.name}` : 'Add New Signage Material to Inventory'}
      description={isEditing ? `Current Stock: ${targetItem.stockQuantity} ${targetItem.unit}` : 'Register raw materials (LEDs, PSUs, Acrylic, Aluminum channels, Vinyl).'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isEditing ? (
          <div className="space-y-3 bg-slate-50 dark:bg-[#09090b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <Input
              label="New Total Stock Quantity *"
              type="number"
              error={errors.stockQuantity?.message}
              {...register('stockQuantity', { valueAsNumber: true })}
              helperText={`Original level was ${targetItem.stockQuantity} ${targetItem.unit}`}
            />
            <Input
              label="Stock Movement Note"
              placeholder="e.g. Stock shipment received from LumiTech invoice #9021"
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>
        ) : (
          <div className="space-y-3 bg-slate-50 dark:bg-[#09090b] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Material Name *"
                error={errors.name?.message}
                placeholder="e.g. Samsung 2835 3-LED White Module"
                {...register('name')}
              />
              <Input
                label="SKU Code"
                error={errors.sku?.message}
                placeholder="e.g. LED-MOD-3W-W"
                {...register('sku')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Material Category"
                options={[
                  { label: 'LED Modules & Strips', value: 'LED_MODULES' },
                  { label: 'Power Supplies & Transformers', value: 'POWER_SUPPLIES' },
                  { label: 'Acrylic & Substrates', value: 'ACRYLIC_SHEETS' },
                  { label: 'Aluminum Profiles & Channels', value: 'ALUMINUM_PROFILES' },
                  { label: 'Vinyl & Flex Banner', value: 'VINYL_FLEX' },
                  { label: 'Controllers & Dimmers', value: 'CONTROLLERS' },
                  { label: 'Fasteners & Hardware', value: 'FASTENERS' },
                ]}
                {...register('category')}
              />
              <Input
                label="Unit of Measurement"
                error={errors.unit?.message}
                placeholder="pcs, meters, sqft, sheets, rolls"
                {...register('unit')}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Initial Stock"
                type="number"
                error={errors.stockQuantity?.message}
                {...register('stockQuantity', { valueAsNumber: true })}
              />
              <Input
                label="Min Reorder Level"
                type="number"
                error={errors.minReorderLevel?.message}
                {...register('minReorderLevel', { valueAsNumber: true })}
              />
              <Input
                label="Unit Cost ($)"
                type="number"
                step="0.01"
                error={errors.unitCostPrice?.message}
                {...register('unitCostPrice', { valueAsNumber: true })}
              />
              <Input
                label="Selling Price ($)"
                type="number"
                step="0.01"
                error={errors.sellingPrice?.message}
                {...register('sellingPrice', { valueAsNumber: true })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Supplier Name"
                error={errors.supplier?.message}
                placeholder="e.g. LumiTech Wholesale Opto"
                {...register('supplier')}
              />
              <Input
                label="Shelf / Bin Location"
                error={errors.binLocation?.message}
                placeholder="e.g. Bin A-12, Rack R-02"
                {...register('binLocation')}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending || updateStockMutation.isPending}
            icon={<Package className="h-4 w-4" />}
          >
            {isEditing ? 'Save Stock Adjustment' : 'Save Material Item'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
