import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  FormFieldWrapper,
  type FormFieldWrapperPropsWithoutChildren,
} from './FormFieldWrapper';
import {Select, type SelectProps} from './Select';

interface FormSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Value = unknown,
  Multiple extends boolean | undefined = false,
>
  extends
    FormFieldWrapperPropsWithoutChildren<TFieldValues, TName>,
    Omit<SelectProps<Value, Multiple>, 'defaultValue' | 'name'> {
  autoFocus?: boolean;
}

export function FormSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Value = unknown,
  Multiple extends boolean | undefined = false,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  children,
  autoFocus,
  ...selectProps
}: FormSelectFieldProps<TFieldValues, TName, Value, Multiple>) {
  return (
    <FormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <Select
          autoFocus={autoFocus}
          id={id}
          triggerClassName='w-full aria-invalid:border-negative aria-invalid:focus:shadow-[0_0_0_2px_var(--always-white),0_0_0_4px_var(--negative)]'
          aria-labelledby={id}
          {...field}
          onValueChange={field.onChange}
          {...selectProps}
          {...(fieldState.invalid &&
            fieldState.error?.message != null && {
              'aria-invalid': true,
              'aria-describedby': errorId,
            })}
        >
          {children}
        </Select>
      )}
    </FormFieldWrapper>
  );
}
