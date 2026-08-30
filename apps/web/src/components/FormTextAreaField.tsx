import {type FieldPath, type FieldValues} from 'react-hook-form';
import {
  FormFieldWrapper,
  type FormFieldWrapperPropsWithoutChildren,
} from './FormFieldWrapper';
import {TextArea} from './TextArea';
import {cn} from '../lib/utils';

interface FormTextAreaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldWrapperPropsWithoutChildren<TFieldValues, TName> {
  placeholder?: string;
  className?: string;
}

export function FormTextAreaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  placeholder,
  className,
}: FormTextAreaFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldWrapper
      label={label}
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
    >
      {({id, errorId, field, fieldState}) => (
        <TextArea
          id={id}
          className={cn(
            'w-full aria-invalid:border-negative aria-invalid:focus:shadow-[0_0_0_2px_var(--always-white),0_0_0_4px_var(--negative)]',
            className,
          )}
          placeholder={placeholder}
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
