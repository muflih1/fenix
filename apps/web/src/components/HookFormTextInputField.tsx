import {TextInput} from './TextInput';
import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  HookFormFieldWrapper,
  type HookFormFieldWrapperPropsWithoutChildren,
} from './HookFormFieldWrapper';

type HookFormTextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormFieldWrapperPropsWithoutChildren<TFieldValues, TName> & {
  type?: React.HTMLInputTypeAttribute;
};

export function HookFormTextInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  type = 'text',
}: HookFormTextInputFieldProps<TFieldValues, TName>) {
  return (
    <HookFormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <TextInput
          type={type}
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
