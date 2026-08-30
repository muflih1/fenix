import type React from 'react';
import {useImperativeHandle, useRef, type ReactNode} from 'react';
import {
  FormProvider,
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';

interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
> extends UseFormProps<TFieldValues> {
  children: ReactNode | ((form: UseFormReturn<TFieldValues>) => ReactNode);
  onSubmit: SubmitHandler<TFieldValues>;
  ref?: React.ForwardedRef<UseFormReturn<TFieldValues>>;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  ref,
  ...options
}: FormProps<TFieldValues>) {
  const form = useForm<TFieldValues>(options);
  useImperativeHandle(ref, () => form, [form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {typeof children === 'function' ? children(form) : children}
      </form>
    </FormProvider>
  );
}

export function useFormRef<TFieldValues extends FieldValues = FieldValues>(
  initialValue: UseFormReturn<TFieldValues> | null,
) {
  return useRef<UseFormReturn<TFieldValues>>(initialValue);
}
