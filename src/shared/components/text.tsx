import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/shared/utils/cn";

const variants = {
  title: "font-host-bold text-[32px] leading-[34px] text-ink",
  subtitle: "font-host text-[16px] text-ink-muted",
  label: "font-host-medium text-[16px] text-ink",
  body: "font-host text-[16px] text-ink",
  caption: "font-host text-[14px] text-ink-muted",
  error: "font-host text-[14px] text-danger",
} as const;

export type TextVariant = keyof typeof variants;

type TextProps = RNTextProps & {
  variant?: TextVariant;
};

export function Text({ variant = "body", className, ...props }: TextProps) {
  return <RNText className={cn(variants[variant], className)} {...props} />;
}