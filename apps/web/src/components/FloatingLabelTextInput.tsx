import {useId, useState} from 'react';
import {useFocusWithin} from '@react-aria/interactions';
import {Input as AriaInput} from 'react-aria-components';
import {cn} from '../lib/utils';

interface FloatingLabelTextInputProps extends React.ComponentProps<'input'> {
  isDisabled?: boolean;
  label: string;
  helperText?: string;
  validationState?: 'ERROR' | null | undefined;
}

export function FloatingLabelTextInput({
  isDisabled,
  disabled,
  label,
  type = 'text',
  validationState,
  helperText,
}: FloatingLabelTextInputProps) {
  const resolvedDisabled = isDisabled ?? disabled ?? false;
  const id = useId();
  const labelledby = useId();
  const errorId = useId();
  const [isFocused, setFocused] = useState(false);
  const {focusWithinProps} = useFocusWithin({
    isDisabled: resolvedDisabled,
    onFocusWithinChange: setFocused,
  });

  return (
    <div className='flex flex-col w-full' {...focusWithinProps}>
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-(--input-corner-radius) cursor-text outline-none z-0 border border-solid border-gray-200 relative',
          isFocused && 'shadow-(--focus-ring-shadow-default)',
        )}
      >
        <span
          id={labelledby}
          className={cn(
            'text-base transition-transform absolute whitespace-nowrap text-secondary-foreground pointer-events-none font-normal leading-tight block overflow-hidden text-ellipsis inset-s-4 inset-e-auto max-w-full origin-top-left duration-100 ease-(--animation-move-in) top-4.5',
            isFocused &&
              '-translate-y-2.75 scale-75 text-blue-500 duration-100 ease-(--animation-move-out)',
          )}
        >
          {label}
        </span>
        <AriaInput
          id={id}
          aria-labelledby={labelledby}
          type={type}
          className={cn(
            'block w-full touch-manipulation text-primary px-4 bg-transparent text-base font-normal leading-tight outline-none border-none pt-6.5 pb-2.5',
          )}
        />
      </div>
      {validationState === 'ERROR' && helperText != null && (
        <div id={errorId} className='mt-1 text-xs text-red-500'>
          {helperText}
        </div>
      )}
    </div>
  );
}
