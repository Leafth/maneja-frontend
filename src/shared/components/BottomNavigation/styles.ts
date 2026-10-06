import { tv } from 'tailwind-variants';

export const bottomNavigationStyles = tv({
  slots: {
    container:
      'border-t border-gray-200 bg-white px-5 pt-3',

    items:
      'flex-row items-start justify-between',

    item:
      'w-[72px] items-center gap-1',
  },
});
