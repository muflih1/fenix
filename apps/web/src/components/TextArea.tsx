import type React from 'react';
import {composeRenderProps} from 'react-aria-components';
import {TextArea as AriaTextArea} from 'react-aria-components/TextArea';
import {cn} from '../lib/utils';

export function TextArea({
  className,
  ...props
}: React.ComponentProps<typeof AriaTextArea>) {
  return (
    <AriaTextArea
      className={composeRenderProps(className, className =>
        cn(
          'field-sizing-content data-focused:outline-2 data-focused:shadow-(--focus-ring-shadow-default) rounded-(--input-corner-radius) border border-gray-200 p-2 text-sm cursor-text box-border relative z-0 transition-[outline-color] duration-150 outline-transparent resize-none min-h-16',
          className,
        ),
      )}
      {...props}
    />
  );
}
