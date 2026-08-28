import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  HookFormFieldWrapper,
  type HookFormFieldWrapperPropsWithoutChildren,
} from './HookFormFieldWrapper';
import {TextArea} from './TextArea';

interface HookFormTextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends HookFormFieldWrapperPropsWithoutChildren<TFieldValues, TName> {}

export function HookFormTextAreaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
}: HookFormTextAreaFieldProps<TFieldValues, TName>) {
  return (
    <HookFormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <TextArea
          id={id}
          className='w-full aria-invalid:border-negative aria-invalid:data-focused:shadow-[0_0_0_2px_var(--always-white),0_0_0_4px_var(--negative)]'
          {...field}
          {...(fieldState.invalid &&
            fieldState.error?.message != null && {
              'aria-invalid': true,
              'aria-describedby': errorId,
            })}
        />
      )}
    </HookFormFieldWrapper>
  );
}
