import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { AppText } from '@/shared/components/AppText';

interface Props {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  className?: string;
}

export function FeedActionButton({ children, onPress, secondary = false, className = '' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`h-12 flex-row items-center justify-center rounded-xl ${secondary ? 'bg-gray-600' : 'bg-forestGreen-400'} ${className}`}
    >
      <AppText size="sm" weight="medium" color={secondary ? 'default' : 'white'}>{children}</AppText>
    </Pressable>
  );
}
