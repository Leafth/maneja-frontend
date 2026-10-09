import { tv, type VariantProps } from 'tailwind-variants';

export const buttonStyles = tv({
  slots: {
    wrapper: 'overflow-hidden rounded-xl',
    button: 'items-center justify-center ios:active:opacity-70',
    content: 'flex-row items-center gap-[10px]',
    label: 'font-sans-medium text-base',
  },
  variants: {
    variant: {
      primary: { button: 'bg-forestGreen-400', label: 'text-white' },
      secondary: { button: 'bg-gray-300', label: 'text-black-700' },
      ghost: { button: 'bg-transparent', label: 'text-black-700' },
      neutral: { button: 'bg-lime-700/5', label: 'text-black-700' },
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
