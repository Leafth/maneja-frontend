import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { buttonStyles, type ButtonVariants } from './styles';

const CONTENT_COLOR = '#18181B'; // black-700

interface IButtonProps
  extends React.ComponentProps<typeof Pressable>,
    Omit<ButtonVariants, 'disabled'> {
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rippleStyle?: 'light' | 'dark';
}

export function Button({
  children,
  variant,
  size,
  disabled: disabledProp,
  className,
  isLoading,
  leftIcon: LeftIcon,
  rippleStyle = 'dark',
  ...props
}: IButtonProps) {
  const disabled = !!disabledProp || !!isLoading;

  const { wrapper, button, content } = buttonStyles({ variant, size, disabled });

  const childEl =
    typeof children === 'string' ? (
      <Text className="font-sans-medium text-base text-black-700">{children}</Text>
    ) : (
      children
    );

  return (
    <View className={wrapper()}>
      <Pressable
        android_ripple={{
          foreground: true,
          color:
            rippleStyle === 'dark'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(255, 255, 255, 0.1)',
        }}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: !!isLoading }}
        className={button({ className })}
        disabled={disabled}
        {...props}
      >
        {!isLoading ? (
          <View className={content()}>
            {LeftIcon && <LeftIcon color={CONTENT_COLOR} size={20} />}
            {childEl as React.ReactElement}
          </View>
        ) : (
          <ActivityIndicator color={CONTENT_COLOR} />
        )}
      </Pressable>
    </View>
  );
}
