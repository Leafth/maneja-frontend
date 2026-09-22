import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/shared/utils/cn";

const SPINNER_COLOR = "#18181B";

const sizes = {
  md: "h-12",
  lg: "h-14",
} as const;

type ButtonProps = Omit<PressableProps, "children"> & {
  title: string;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export function Button({
  title,
  size = "lg",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = !!disabled;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled || loading}
      className={cn(
        "w-full items-center justify-center rounded-[10px] bg-primary",
        sizes[size],
        isDisabled ? "opacity-40" : "active:opacity-80",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR} />
      ) : (
        <Text className="font-host-medium text-[16px] text-ink">{title}</Text>
      )}
    </Pressable>
  );
}