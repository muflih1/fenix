import {
  Input as BaseInput,
  type InputProps as BaseInputProps,
} from '@base-ui/react/input';
import {composeTailwindRenderProps} from '../lib/utils';

export interface TextInputProps extends BaseInputProps {}

export function TextInput({className, ...props}: TextInputProps) {
  return (
    <BaseInput
      className={composeTailwindRenderProps(
        className,
        'outline-none focus:shadow-(--focus-ring-shadow-default) rounded-(--input-corner-radius) border border-(--input-border-color) h-9 p-2 text-sm cursor-text box-border relative z-0',
      )}
      {...props}
    />
  );
}

export namespace TextInput {
  export type Props = TextInputProps;
}
