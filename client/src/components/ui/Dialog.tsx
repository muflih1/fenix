import React from 'react';
import {
  ModalOverlay,
  Modal,
  Dialog as AriaDialog,
  Heading,
  Button as AriaButton
} from 'react-aria-components';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg'
}: DialogProps) {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  } as const;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 dark:bg-black/85 backdrop-blur-sm transition-opacity animate-in fade-in"
    >
      <Modal
        className={cn(
          'relative w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-6 shadow-xl dark:shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col z-10 text-slate-900 dark:text-zinc-100 outline-none overflow-hidden border-t-4 border-t-yellow-400',
          maxWidths[maxWidth]
        )}
      >
        <AriaDialog className="outline-none flex flex-col h-full overflow-hidden">
          {() => (
            <>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
                <div>
                  {title && (
                    <Heading slot="title" className="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      {title}
                    </Heading>
                  )}
                  {description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{description}</p>
                  )}
                </div>
                <AriaButton
                  onPress={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1.5 text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <X className="h-4 w-4" />
                </AriaButton>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-4 pr-1 text-xs text-slate-700 dark:text-zinc-200">
                {children}
              </div>
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}
