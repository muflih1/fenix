import {mergeProps, useRender} from '@base-ui/react';
import {cn} from '../lib/utils';

export interface AvatarFallbackProps extends useRender.ComponentProps<'div'> {}

export function AvatarFallback({
  className,
  render,
  ref,
  ...props
}: AvatarFallbackProps) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex size-8 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs select-none font-medium',
          className,
        ),
      },
      props,
    ),
    render,
    ref,
  });
}

export namespace AvatarFallback {
  export type Props = AvatarFallbackProps;
}
