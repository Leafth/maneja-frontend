import { tv, type VariantProps } from 'tailwind-variants';

export const inputStyles = tv({
  slots: {
    container: 'flex-row items-center gap-2',
    input:
      'bg-white border border-solid rounded-[10px] h-[52px] px-[14px] text-base text-black-700 font-sans-regular',
    suffix:
      'w-[57px] h-[52px] rounded-[10px] bg-gray-100 items-center justify-center',
  },
  variants: {
    status: {
      default: { input: 'border-gray-400' },
      focus: { input: 'border-gray-700' },
      error: { input: 'border-support-red' },
    },
    disabled: {
      true: { input: 'opacity-50' },
      false: { input: 'opacity-100' },
    },
    hasSuffix: {
      true: { input: 'flex-1' },
      false: {},
    },
  },
  defaultVariants: {
    status: 'default',
    disabled: false,
    hasSuffix: false,
  },
});

export type InputVariants = VariantProps<typeof inputStyles>;
