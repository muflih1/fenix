import {
  Input as AriaInput,
  type InputProps as AriaInputProps,
} from 'react-aria-components/Input';
import {cn} from '../lib/utils';
import type React from 'react';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';

export interface TextInputProps extends AriaInputProps {
  ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({className, ...props}: TextInputProps) {
  return (
    <AriaInput
      className={composeRenderProps(className, className =>
        cn(
          'data-focused:outline-2 data-focused:shadow-(--focus-ring-shadow-default) rounded-(--input-corner-radius) border border-gray-200 h-9 p-2 text-sm cursor-text box-border relative z-0 transition-[outline-color] duration-150 outline-transparent',
          className,
        ),
      )}
      {...props}
    />
  );
}

export namespace TextInput {
  export type Props = TextInputProps;
}
