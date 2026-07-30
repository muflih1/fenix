import React from 'react';
import {Dialog} from './Dialog';
import {Button} from './Button';
import {AlertTriangle, Trash2} from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'amber' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete Item',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth='md'>
      <div className='space-y-4'>
        {/* Icon & Title Header */}
        <div className='flex items-start gap-4'>
          <div className='p-3 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shrink-0'>
            <AlertTriangle className='h-6 w-6' />
          </div>
          <div>
            <h3
              className='font-heading text-lg font-extrabold text-slate-900 dark:text-white tracking-tight'
              slot='title'
            >
              {title}
            </h3>
            <p
              className='text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed'
              slot='description'
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800'>
          <Button
            type='button'
            variant='ghost'
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type='button'
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            icon={<Trash2 className='h-4 w-4' />}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
