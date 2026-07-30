import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export const trendTagVariants = cva(
  'text-[10px] font-bold px-2 py-0.5 rounded-md border select-none',
  {
    variants: {
      trendType: {
        positive: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        negative: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
        neutral: 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800',
        warning: 'bg-yellow-100 dark:bg-yellow-400/10 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-400/30',
      },
    },
    defaultVariants: {
      trendType: 'positive',
    },
  }
);

export interface StatCardProps extends VariantProps<typeof trendTagVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  accentColor?: 'cyan' | 'magenta' | 'amber' | 'emerald';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-zinc-700'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {title}
        </span>
        <div className="rounded-lg p-2.5 bg-yellow-50 dark:bg-zinc-900 text-amber-700 dark:text-yellow-400 border border-yellow-200 dark:border-zinc-800">{icon}</div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {trend && (
          <span className={cn(trendTagVariants({ trendType }))}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">{subtitle}</p>}
    </div>
  );
}
