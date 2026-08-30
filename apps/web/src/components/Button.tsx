import {
  Button as BaseButton,
  type ButtonProps as BaseButtonProps,
} from '@base-ui/react/button';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn, composeRenderProps} from '../lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-none outline-none bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors select-none focus-visible:shadow-(--focus-ring-shadow-default) active:not-aria-[haspopup]:scale-98 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 not-disabled:cursor-pointer relative",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-(--divider) border-solid bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-(--secondary-button-surface) text-(--secondary-button-foreground) hover:bg-[color-mix(in_oklch,var(--secondary-button-surface),var(--primary)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 rounded-[18px]',
        xs: "h-7 gap-1 rounded-[14px] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-2xl px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-9 rounded-full',
        'icon-xs':
          "size-7 rounded-full in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-full in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends BaseButtonProps, VariantProps<typeof buttonVariants> {
  padding?: 'wide' | 'default';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  padding = 'default',
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={composeRenderProps(className, className =>
        cn(
          buttonVariants({className, size, variant}),
          padding === 'wide' && 'px-10',
        ),
      )}
      {...props}
    />
  );
}

export namespace Button {
  export type Props = ButtonProps;
}
