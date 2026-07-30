import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide transition-colors select-none',
  {
    variants: {
      variant: {
        enquiry: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        site_survey: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        survey: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        quotation: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        approved_job: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold',
        design_mockup: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        production: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30 font-semibold',
        installation: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30 font-semibold',
        completed: 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-black border-slate-800 dark:border-zinc-200 font-bold',
        cancelled: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
        high: 'bg-amber-100 dark:bg-yellow-400/10 text-amber-800 dark:text-yellow-400 border-amber-300 dark:border-yellow-400/30 font-semibold',
        urgent: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold',
        normal: 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800',
        cyan: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        amber: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30 font-semibold',
        slate: 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800',
      },
    },
    defaultVariants: {
      variant: 'slate',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {children}
    </div>
  );
}
