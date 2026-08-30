import {TextInput} from './TextInput';
import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  FormFieldWrapper,
  type FormFieldWrapperPropsWithoutChildren,
} from './FormFieldWrapper';

type FormTextInputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FormFieldWrapperPropsWithoutChildren<TFieldValues, TName> & {
  type?: React.HTMLInputTypeAttribute;
  numeric?: boolean;
  autoFocus?: boolean;
};

export function FormTextInputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  type = 'text',
  numeric = false,
  autoFocus,
}: FormTextInputFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <TextInput
          autoFocus={autoFocus}
          type={type}
          id={id}
          className='w-full aria-invalid:border-negative aria-invalid:focus:shadow-[0_0_0_2px_var(--always-white),0_0_0_4px_var(--negative)]'
          onBeforeInput={
            numeric
              ? event => {
                  if (event.data != null && !/^\d$/.test(event.data)) {
                    event.preventDefault();
                  }
                }
              : undefined
          }
          {...field}
          {...(fieldState.invalid &&
            fieldState.error?.message != null && {
              'aria-invalid': true,
              'aria-describedby': errorId,
            })}
        />
      )}
    </FormFieldWrapper>
  );
}
