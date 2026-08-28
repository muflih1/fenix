import {useId, type ReactNode} from 'react';
import {
  Controller,
  type ControllerFieldState,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormStateReturn,
} from 'react-hook-form';

export type HookFormFieldWrapperRenderProps = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  id: string;
  errorId: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}) => ReactNode;

export type HookFormFieldWrapperPropsWithoutChildren<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<HookFormFieldWrapperProps<TFieldValues, TName>, 'children'>;

export type HookFormFieldWrapperProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<
  ControllerProps<TFieldValues, TName>,
  'control' | 'name' | 'defaultValue' | 'disabled'
> & {
  label: string;
  children: HookFormFieldWrapperRenderProps;
};

export function HookFormFieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  defaultValue,
  label,
  children,
}: HookFormFieldWrapperProps<TFieldValues, TName>) {
  const id = useId();
  const errorId = useId();

  return (
    <Controller
      disabled={disabled}
      defaultValue={defaultValue}
      control={control}
      name={name}
      render={({field, fieldState, formState}) => (
        <div className='relative space-y-1.5'>
          <label htmlFor={id} className='text-sm font-medium'>
            {label}
          </label>
          {children<TFieldValues, TName>({
            id,
            errorId,
            field,
            fieldState,
            formState,
          })}
          {fieldState.invalid && fieldState.error?.message != null && (
            <p id={errorId} className='text-xs text-secondary-foreground'>
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
