import { useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { Text } from "@/shared/components/text";
import { cn } from "@/shared/utils/cn";

const PLACEHOLDER_COLOR = "#A1A1AA";

type InputProps = Omit<TextInputProps, "className"> & {
  label: string;
  error?: string;
  helperText?: string;
  className?: string;
  ref?: React.Ref<TextInput>;
};

export function Input({
  label,
  error,
  helperText,
  className,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("w-full gap-2", className)}>
      <Text variant="label">{label}</Text>

      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={PLACEHOLDER_COLOR}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "h-14 rounded-[10px] border bg-white px-4 font-host text-[16px] text-ink",
          error ? "border-danger" : focused ? "border-ink" : "border-line",
        )}
        {...props}
      />

      {error ? (
        <Text variant="error">{error}</Text>
      ) : helperText ? (
        <Text variant="caption">{helperText}</Text>
      ) : null}
    </View>
  );
}