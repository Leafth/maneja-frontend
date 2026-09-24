import { tv, type VariantProps } from 'tailwind-variants';

export const buttonStyles = tv({
  slots: {
    wrapper: 'overflow-hidden rounded-xl',
    button: 'items-center justify-center ios:active:opacity-70',
    content: 'flex-row items-center gap-[10px]',
  },
  variants: {
    variant: {
      primary: { button: 'bg-lime-500' },
      secondary: { button: 'bg-gray-300' },
      ghost: { button: 'bg-transparent' },
      neutral: { button: 'bg-lime-700/5' },
    },
    size: {
      md: { button: 'h-12 px-6' },
      lg: { button: 'h-14 px-6' },
      icon: { button: 'h-12 w-12' },
    },
    disabled: {
      true: { button: 'opacity-40' },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'lg',
    disabled: false,
  },
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
