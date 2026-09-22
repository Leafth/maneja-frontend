import type { ComponentProps } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Input } from "@/shared/components/input";

type FormInputProps<T extends FieldValues> = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChangeText" | "onBlur" | "error" | "ref"
> & {
  control: Control<T>;
  name: Path<T>;
};

export function FormInput<T extends FieldValues>({
  control,
  name,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...props}
          ref={field.ref}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}