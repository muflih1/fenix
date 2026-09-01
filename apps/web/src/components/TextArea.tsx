import type React from 'react';
import {cn} from '../lib/utils';

export function TextArea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'field-sizing-content focus:shadow-(--focus-ring-shadow-default) rounded-(--input-corner-radius) border border-(--input-border-color) p-2 text-sm cursor-text box-border relative z-0 resize-none min-h-16 outline-0',
        className,
      )}
      {...props}
    />
  );
}
