import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  HookFormFieldWrapper,
  type HookFormFieldWrapperPropsWithoutChildren,
} from './HookFormFieldWrapper';
import {Select, type SelectProps} from './Select';

interface HookFormSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T = unknown,
  M extends 'single' | 'multiple' = 'single',
>
  extends
    HookFormFieldWrapperPropsWithoutChildren<TFieldValues, TName>,
    Omit<SelectProps<T, M>, 'defaultValue' | 'name'> {}

export function HookFormSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T = unknown,
  M extends 'single' | 'multiple' = 'single',
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  children,
  ...selectProps
}: HookFormSelectFieldProps<TFieldValues, TName, T, M>) {
  return (
    <HookFormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <Select
          id={id}
          className='w-full aria-invalid:border-negative aria-invalid:data-focused:shadow-[0_0_0_2px_var(--always-white),0_0_0_4px_var(--negative)]'
          aria-labelledby={id}
          {...selectProps}
          {...field}
          {...(fieldState.invalid &&
            fieldState.error?.message != null && {
              'aria-invalid': true,
              'aria-describedby': errorId,
            })}
        >
          {children}
        </Select>
      )}
    </HookFormFieldWrapper>
  );
}
