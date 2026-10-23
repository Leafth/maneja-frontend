import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import colors from '@/styles/colors';

import { buttonStyles, type ButtonVariants } from './styles';

type Variant = NonNullable<ButtonVariants['variant']>;

// Cor de ícones e do loading, alinhada com a cor do texto de cada variante.
const ICON_COLORS: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.black[700],
  ghost: colors.black[700],
  neutral: colors.black[700],
};

interface IButtonProps
  extends React.ComponentProps<typeof Pressable>,
    Omit<ButtonVariants, 'disabled'> {
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  /** Padrão: 'light' no primary (fundo escuro) e 'dark' nas demais. */
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
  rippleStyle,
  ...props
}: IButtonProps) {
  const disabled = !!disabledProp || !!isLoading;
  const resolvedVariant: Variant = variant ?? 'primary';
  const iconColor = ICON_COLORS[resolvedVariant];
  const ripple = rippleStyle ?? (resolvedVariant === 'primary' ? 'light' : 'dark');

  const { wrapper, button, content, label } = buttonStyles({
    variant: resolvedVariant,
    size,
    disabled,
  });

  const childEl =
    typeof children === 'string' ? (
      <Text className={label()}>{children}</Text>
    ) : (
      children
    );

  return (
    <View className={wrapper()}>
      <Pressable
        android_ripple={{
          foreground: true,
          color:
            ripple === 'dark'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(255, 255, 255, 0.1)',
        }}
        accessibilityRole='button'
        accessibilityState={{ disabled, busy: !!isLoading }}
        className={button({ className })}
        disabled={disabled}
        {...props}
      >
        {!isLoading ? (
          <View className={content()}>
            {LeftIcon && <LeftIcon color={iconColor} size={20} />}
            {childEl as React.ReactElement}
          </View>
        ) : (
          <ActivityIndicator color={iconColor} />
        )}
      </Pressable>
    </View>
  );
}
