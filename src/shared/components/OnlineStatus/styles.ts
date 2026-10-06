import { tv } from 'tailwind-variants';

export const onlineStatusStyles = tv({
  slots: {
    container: 'flex-row items-center gap-1.5',
    icon: 'text-black-700',
    text: 'text-black-700',
  },
});
