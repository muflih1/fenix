import {IconCaretDownFilled, IconCheckFilled} from '@tabler/icons-react';
import {
  Button as AriaButton,
  composeRenderProps,
  // Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  // ListBoxSection as AriaListBoxSection,
  Popover as AriaPopover,
  // SearchField,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  // Separator as AriaSeparator,
  type ListBoxProps as AriaListBoxProps,
  // type SearchFieldProps,
  // type ListBoxSectionProps as SelectGroupProps,
  type SelectProps as AriaSelectProps,
  // type SelectValueProps,
  type ListBoxItemProps,
  // Collection,
  // type ListBoxSectionProps,
} from 'react-aria-components';
import {cn, composeTailwindRenderProps} from '../lib/utils';
import {tv} from 'tailwind-variants';

export interface SelectProps<T, M extends 'single' | 'multiple'> extends Omit<
  AriaSelectProps<T, M>,
  'children'
> {
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T, M extends 'single' | 'multiple' = 'single'>({
  children,
  items,
  ...props
}: SelectProps<T, M>) {
  return (
    <AriaSelect
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group flex flex-col gap-1',
      )}
    >
      <AriaButton className='flex items-center text-start gap-4 w-full border border-gray-200 cursor-default rounded-(--input-corner-radius) pl-3 pr-2 h-9 bg-transparent [-webkit-tap-highlight-color:transparent] outline-none data-focused:shadow-(--focus-ring-shadow-default)'>
        <AriaSelectValue className='grow shrink text-sm'>
          {({selectedText, defaultChildren}) => selectedText || defaultChildren}
        </AriaSelectValue>
        <IconCaretDownFilled
          aria-hidden
          size={20}
          className='text-secondary-foreground'
        />
      </AriaButton>
      <AriaPopover offset={4} className='bg-white shadow-[0_12px_16px_-4px_rgb(10_10_10_/.10)] rounded-2xl border border-black/10 text-neutral-700 outline-0 overflow-y-auto flex flex-col duration-200 origin-top-left data-entering:-translate-y-2 data-entering:opacity-0 data-entering:scale-95 data-entering:duration-200 data-entering:ease-out data-exiting:-translate-y-2 data-exiting:scale-95 data-exiting:opacity-0 data-exiting:duration-200 data-exiting:ease-in min-w-(--trigger-width)'>
        <ListBox
          items={items}
          className='outline-hidden box-border p-1 max-h-[inherit] overflow-auto'
        >
          {children}
        </ListBox>
      </AriaPopover>
    </AriaSelect>
  );
}

export function SelectItem({className, ...props}: ListBoxItemProps) {
  return (
    <DropdownItem
      {...props}
      className={composeTailwindRenderProps(
        className,
        'min-h-8 data-hovered:bg-[rgba(194,189,184,.1)]',
      )}
    />
  );
}

function ListBox<T>({
  children,
  className,
  ...props
}: Omit<AriaListBoxProps<T>, 'layout' | 'orientation'>) {
  return (
    <AriaListBox {...props} className={className}>
      {children}
    </AriaListBox>
  );
}

const itemStyles = tv({
  base: 'group relative flex items-center gap-8 cursor-default select-none py-1.5 px-2.5 rounded-md will-change-transform text-sm forced-color-adjust-none',
  variants: {
    isFocusVisible: {
      true: 'shadow-(--focus-ring-shadow-default)',
    },
    isSelected: {
      false:
        'text-neutral-700 hover:bg-neutral-100 pressed:bg-neutral-100 -outline-offset-2',
      true: 'bg-blue-600 text-white forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] [&:has(+[data-selected])]:rounded-b-none [&+[data-selected]]:rounded-t-none -outline-offset-4 outline-white forced-colors:outline-[HighlightText]',
    },
    isDisabled: {
      true: 'text-neutral-300 forced-colors:text-[GrayText]',
    },
  },
});

function ListBoxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={itemStyles}>
      {composeRenderProps(props.children, children => (
        <>
          {children}
          <div className='absolute left-4 right-4 bottom-0 h-px bg-white/20 forced-colors:bg-[HighlightText] hidden [.group[data-selected]:has(+[data-selected])_&]:block' />
        </>
      ))}
    </AriaListBoxItem>
  );
}

const dropdownItemStyles = tv({
  base: 'group/dropdown-item flex items-center gap-4 cursor-default select-none py-1.5 pl-2 pr-3 selected:pr-1 rounded-xl outline outline-0 text-sm forced-color-adjust-none no-underline [&[href]]:cursor-pointer [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      false: 'text-neutral-900',
      true: 'text-neutral-300 forced-colors:text-[GrayText]',
    },
    isPressed: {
      true: 'bg-neutral-100',
    },
    isFocused: {
      true: 'bg-[rgba(194,189,184,.2)] text-primary forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
});

export function DropdownItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue ||
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={dropdownItemStyles}
    >
      {composeRenderProps(props.children, (children, {isSelected}) => (
        <>
          <span className='flex items-center flex-1 gap-2 font-normal truncate group-data-selected/dropdown-item:font-medium'>
            {children}
          </span>
          <span className='flex items-center w-5'>
            {isSelected && <IconCheckFilled size={20} />}
          </span>
        </>
      ))}
    </AriaListBoxItem>
  );
}

// function DropdownSection<T>(
//   props: ListBoxSectionProps<T> & {
//     title?: string;
//     items?: any;
//   },
// ) {
//   return (
//     <AriaListBoxSection className="first:-mt-[5px] after:content-[''] after:block after:h-[5px] last:after:hidden">
//       <AriaHeader className='text-sm font-semibold text-neutral-500 dark:text-neutral-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-neutral-100/60 dark:bg-neutral-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-neutral-100 border-y border-y-neutral-200 dark:border-y-neutral-700 [&+*]:mt-1'>
//         {props.title}
//       </AriaHeader>
//       <Collection items={props.items}>{props.children}</Collection>
//     </AriaListBoxSection>
//   );
// }
