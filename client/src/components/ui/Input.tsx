import React from 'react';
import { 
  TextField, 
  Label, 
  Input as AriaInput, 
  FieldError, 
  Text,
  InputProps as AriaInputProps
} from 'react-aria-components';
import { cn } from '../../utils/cn';

export interface InputProps extends AriaInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, ...props }, ref) => {
    return (
      <TextField className="w-full space-y-1.5" isInvalid={!!error}>
        {label && (
          <Label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <AriaInput
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#09090b] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:border-yellow-500 dark:focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:focus:ring-yellow-400 data-[disabled]:opacity-50 transition-colors shadow-xs',
              icon && 'pl-10',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <FieldError className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</FieldError>}
        {helperText && !error && <Text slot="description" className="text-xs text-slate-500 dark:text-zinc-500">{helperText}</Text>}
      </TextField>
    );
  }
);

Input.displayName = 'Input';
