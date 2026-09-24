import React from 'react';
import { Text } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

export const appTextStyles = tv({
  base: '',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
    weight: {
      light: 'font-sans-light',
      regular: 'font-sans-regular',
      medium: 'font-sans-medium',
      semiBold: 'font-sans-semiBold',
      bold: 'font-sans-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    color: {
      default: 'text-black-700',
      muted: 'text-gray-700',
      error: 'text-support-red',
      primary: 'text-lime-700',
      lime: 'text-lime-500',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'regular',
    align: 'left',
    color: 'default',
  },
});

export type AppTextVariants = VariantProps<typeof appTextStyles>;

interface IAppTextProps
  extends React.ComponentProps<typeof Text>,
    AppTextVariants {}

export function AppText({
  size,
  weight,
  align,
  color,
  className,
  ...props
}: IAppTextProps) {
  return (
    <Text
      className={appTextStyles({ size, weight, align, color, className })}
      {...props}
    />
  );
}
