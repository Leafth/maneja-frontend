import { ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IFeedStockCardProps {
  name: string;
  availableKg: number;
  onPress: () => void;
}

function FeedStockCardComponent({
  name,
  availableKg,
  onPress,
}: IFeedStockCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={`${name}, ${availableKg} kg disponíveis`}
      className='flex-row items-center rounded-[14px] border border-neutral-border bg-neutral-card px-5 py-4 active:opacity-80'
    >
      <View className='mr-3 flex-1'>
        <AppText
          size='lg'
          weight='medium'
          className='text-neutral-textHead'
          numberOfLines={1}
        >
          {name}
        </AppText>

        <AppText size='sm' className='mt-1 text-neutral-textMuted'>
          {availableKg} kg disponíveis
        </AppText>
      </View>

      <ChevronRight size={20} color={colors.neutral.textMuted} />
    </Pressable>
  );
}

export const FeedStockCard = memo(FeedStockCardComponent);
