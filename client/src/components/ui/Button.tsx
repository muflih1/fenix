import React from 'react';
import {
  Button as AriaButton,
  ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../../utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none data-focus-visible:ring-2 data-focus-visible:ring-yellow-400 data-disabled:opacity-50 data-disabled:cursor-not-allowed cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-yellow-400 text-black hover:bg-yellow-300 shadow-sm border border-yellow-500/80 data-pressed:scale-[0.98]',
        magenta:
          'bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-500/80 data-pressed:scale-[0.98]',
        outline:
          'border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-xs data-pressed:scale-[0.98]',
        ghost:
          'bg-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white',
        danger:
          'bg-rose-600 dark:bg-rose-950/80 hover:bg-rose-700 dark:hover:bg-rose-900 border border-rose-600 dark:border-rose-800/60 text-white dark:text-rose-200 shadow-xs data-pressed:scale-[0.98]',
        negative:
          'bg-rose-600 dark:bg-rose-950/80 hover:bg-rose-700 dark:hover:bg-rose-900 border border-rose-600 dark:border-rose-800/60 text-white dark:text-rose-200 shadow-xs data-pressed:scale-[0.98]',
        positive:
          'bg-emerald-600 dark:bg-zinc-100 hover:bg-emerald-700 dark:hover:bg-white text-white dark:text-black shadow-xs data-pressed:scale-[0.98]',
        amber:
          'bg-yellow-400 text-black hover:bg-yellow-300 shadow-sm border border-yellow-500/80 data-pressed:scale-[0.98]',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 gap-1.5',
        md: 'text-xs px-3.5 py-2 gap-2',
        lg: 'text-sm px-4.5 py-2.5 gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    Omit<AriaButtonProps, 'className'>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  ref,
  className,
  variant,
  size,
  icon,
  children,
  disabled,
  isDisabled,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      ref={ref}
      isDisabled={isDisabled ?? disabled}
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    >
      {icon && <span className='shrink-0 text-current'>{icon}</span>}
      {children}
    </AriaButton>
  );
}
