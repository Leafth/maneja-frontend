import { ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import { FeedCoverageBadge } from './FeedCoverageBadge';

interface IFeedStockCardProps {
  name: string;

  /** Quantidade já formatada, ex.: "1.414 kg". */
  availableLabel: string;

  dailyRequiredLabel: string | null;

  projectedStockScaled: number;

  daysRemaining: number | null;

  alertLevel: 'critical' | 'urgency' | 'attention' | 'info' | null;

  onPress: () => void;
}

function FeedStockCardComponent({
  name,
  availableLabel,
  dailyRequiredLabel,
  projectedStockScaled,
  daysRemaining,
  alertLevel,
  onPress,
}: IFeedStockCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={`${name}, ${availableLabel} disponíveis`}
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
          {availableLabel} disponíveis
          {dailyRequiredLabel ? ` · ${dailyRequiredLabel}/dia` : ''}
        </AppText>
      </View>

      <View className='mr-2'>
        <FeedCoverageBadge
          daysRemaining={daysRemaining}
          alertLevel={alertLevel}
          stockScaled={projectedStockScaled}
        />
      </View>

      <ChevronRight size={20} color={colors.neutral.textMuted} />
    </Pressable>
  );
}

export const FeedStockCard = memo(FeedStockCardComponent);
