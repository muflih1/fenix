import type {ReactNode} from 'react';
import {IconCaretDownFilled, IconCheckFilled} from '@tabler/icons-react';
import {Select as BaseSelect} from '@base-ui/react/select';
import {tv} from 'tailwind-variants';

import {composeTailwindRenderProps} from '../lib/utils';
import type React from 'react';

export interface SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> extends BaseSelect.Root.Props<Value, Multiple> {
  addOnStart?: ReactNode;
  addOnEnd?: ReactNode;
  className?: Pick<BaseSelect.Popup.Props, 'className'>['className'];
  triggerClassName?: Pick<BaseSelect.Trigger.Props, 'className'>['className'];
  placeholder?: Pick<BaseSelect.Value.Props, 'placeholder'>['placeholder'];
  'aria-labelledby'?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  ref?: Pick<BaseSelect.Trigger.Props, 'ref'>['ref'];
  'aria-describedby'?: string;
  autoFocus?: boolean;
}

export function Select<Value, Multiple extends boolean | undefined = false>({
  children,
  items,
  addOnStart,
  className,
  triggerClassName,
  placeholder,
  addOnEnd,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  ref,
  autoFocus,
  ...props
}: SelectProps<Value, Multiple>) {
  return (
    <BaseSelect.Root {...props} items={items}>
      <BaseSelect.Trigger
        autoFocus={autoFocus}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        ref={ref}
        className={composeTailwindRenderProps(
          triggerClassName,
          'flex items-center text-start gap-4 w-full border border-(--input-border-color) cursor-default rounded-(--input-corner-radius) pl-3 pr-2 h-9 bg-transparent [-webkit-tap-highlight-color:transparent] outline-none focus:shadow-(--focus-ring-shadow-default)',
        )}
      >
        <BaseSelect.Value
          className='grow shrink text-sm'
          placeholder={placeholder}
        />
        <BaseSelect.Icon>
          <IconCaretDownFilled
            aria-hidden
            size={20}
            className='text-secondary-foreground'
          />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={4}
          className='isolate z-50'
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup
            className={composeTailwindRenderProps(
              className,
              'bg-white isolate z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) shadow-[0_12px_16px_-4px_rgb(10_10_10_/.10)] rounded-2xl border border-black/10 outline-0 overflow-y-auto flex flex-col duration-200 data-starting-style:-translate-y-2 data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:-translate-y-2 data-ending-style:scale-95 data-ending-style:opacity-0 data-[side=top]:origin-bottom-left',
            )}
          >
            {addOnStart}
            <BaseSelect.List className='outline-hidden box-border p-1 max-h-[inherit] flex flex-col overflow-auto min-h-0'>
              {children}
            </BaseSelect.List>
            {addOnEnd}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item
      {...props}
      className={composeTailwindRenderProps(
        className,
        'group/dropdown-item flex items-center gap-4 cursor-default select-none py-1.5 pl-2.25 pr-3 selected:pr-1 rounded-xl ouline-0 text-sm forced-color-adjust-none no-underline [[href]]:cursor-pointer [-webkit-tap-highlight-color:transparent] min-h-8 data-highlighted:bg-black/5 data-selected:bg-black/5 outline-0 data-selected:py-2',
      )}
    >
      <span className='flex items-center flex-1 gap-2 font-normal truncate group-data-selected/dropdown-item:font-medium'>
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      </span>

      <span className='flex items-center w-5'>
        <BaseSelect.ItemIndicator>
          <IconCheckFilled size={20} />
        </BaseSelect.ItemIndicator>
      </span>
    </BaseSelect.Item>
  );
}

export const dropdownItemStyles = tv({
  base: 'group/dropdown-item flex items-center gap-4 cursor-default select-none py-1.5 pl-2 pr-3 selected:pr-1 rounded-xl outline outline-0 text-sm forced-color-adjust-none no-underline [&[href]]:cursor-pointer [-webkit-tap-highlight-color:transparent]',
  variants: {
    disabled: {
      false: 'text-neutral-900',
      true: 'text-neutral-300 forced-colors:text-[GrayText]',
    },
    highlighted: {
      true: 'bg-[rgba(194,189,184,.2)] text-primary forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
});

export function DropdownItem({children, ...props}: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item {...props} className={dropdownItemStyles}>
      <span className='flex items-center flex-1 gap-2 font-normal truncate'>
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      </span>

      <span className='flex items-center w-5'>
        <BaseSelect.ItemIndicator>
          <IconCheckFilled size={20} />
        </BaseSelect.ItemIndicator>
      </span>
    </BaseSelect.Item>
  );
}
