import {
  Select as AriaSelect,
  Label,
  Button as AriaButton,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  FieldError,
  Key,
} from 'react-aria-components';
import {ChevronDown, Check} from 'lucide-react';
import {cn} from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: {target: {value: string}}) => void;
  onSelectionChange?: (key: Key | null) => void;
  disabled?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  error,
  options,
  value,
  onChange,
  onSelectionChange,
  disabled,
  isDisabled,
  placeholder = '-- Select --',
  className,
}: SelectProps) {
  const selectedKey = value !== undefined ? String(value) : undefined;

  const handleSelectionChange = (key: Key | null) => {
    if (key === null) return;
    const val = String(key);
    if (onSelectionChange) onSelectionChange(key);
    if (onChange) {
      onChange({target: {value: val}} as any);
    }
  };

  return (
    <AriaSelect
      selectedKey={selectedKey}
      onSelectionChange={handleSelectionChange}
      isDisabled={isDisabled ?? disabled}
      placeholder={placeholder}
      className={cn('w-full space-y-1.5', className)}
    >
      {label && (
        <Label className='block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider'>
          {label}
        </Label>
      )}
      <AriaButton className='w-full flex items-center justify-between rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#09090b] px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-zinc-100 hover:border-slate-400 dark:hover:border-zinc-700 focus:outline-none data-focus-visible:ring-2 data-focus-visible:ring-yellow-400 data-disabled:opacity-50 transition-all cursor-pointer shadow-xs'>
        <SelectValue className='truncate text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 max-w-full' />
        <ChevronDown className='h-4 w-4 text-slate-500 dark:text-zinc-500 shrink-0 ml-2' />
      </AriaButton>
      <Popover className='z-50 min-w-(--trigger-width) rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-1.5 shadow-xl dark:shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 outline-none'>
        <ListBox className='outline-none space-y-0.5 max-h-full overflow-y-auto pr-0.5'>
          {options.map(opt => (
            <ListBoxItem
              key={opt.value}
              id={opt.value}
              textValue={opt.label}
              className='flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-yellow-50 dark:hover:bg-zinc-800 hover:text-amber-900 dark:hover:text-white data-selected:bg-yellow-100 dark:data-selected:bg-zinc-800 data-selected:text-amber-900 dark:data-selected:text-yellow-400 cursor-pointer outline-none transition-colors data-focus-visible:bg-bg-yellow-50 dark:data-focus-visible:bg-zinc-800'
            >
              {({isSelected}) => (
                <>
                  <span
                    className={cn(
                      'truncate',
                      isSelected &&
                        'font-bold text-amber-900 dark:text-yellow-400',
                    )}
                  >
                    {opt.label}
                  </span>
                  {isSelected && (
                    <Check className='h-3.5 w-3.5 text-amber-600 dark:text-yellow-400 shrink-0 ml-2' />
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
      {error && (
        <FieldError className='text-xs text-rose-500 dark:text-rose-400 font-medium'>
          {error}
        </FieldError>
      )}
    </AriaSelect>
  );
}
