import { tv, type VariantProps } from 'tailwind-variants';

export const otpInputStyles = tv({
  base: [
    'bg-white',
    'border',
    'border-solid',
    'rounded-[10px]',
    'w-[48px]',
    'h-[48px]',
    'text-lg',
    'text-black-700',
    'font-sans-regular',
  ],

  variants: {
    status: {
      default: 'border-gray-400',
      focus: 'border-primary-500',
      filled: 'border-primary-500',
      error: 'border-support-red',
    },

    disabled: {
      true: 'opacity-50',
      false: 'opacity-100',
    },
  },

  defaultVariants: {
    status: 'default',
    disabled: false,
  },
});

export type OtpInputVariants = VariantProps<typeof otpInputStyles>;
