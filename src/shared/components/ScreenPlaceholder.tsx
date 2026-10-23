import { AppText } from '@/shared/components/AppText';
import { View } from 'react-native';

export function ScreenPlaceholder({ name }: { name: string }) {
  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <AppText color='muted'>{name} (em construção)</AppText>
    </View>
  );
}
