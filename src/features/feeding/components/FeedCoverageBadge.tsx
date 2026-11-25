import { TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

type FeedAlertLevel = 'critical' | 'urgency' | 'attention' | 'info' | null;

interface FeedCoverageBadgeProps {
  daysRemaining: number | null;
  alertLevel: FeedAlertLevel;
  stockScaled: number;
}

export function FeedCoverageBadge({
  daysRemaining,
  alertLevel,
  stockScaled,
}: FeedCoverageBadgeProps) {
  if (stockScaled <= 0) {
    return (
      <View className='flex-row items-center gap-1.5 rounded-full bg-support-danger-solid px-3 py-1.5'>
        <TriangleAlert size={14} strokeWidth={2} color={colors.white} />

        <AppText size='xs' weight='semiBold' color='white'>
          Sem estoque
        </AppText>
      </View>
    );
  }

  if (daysRemaining === null) {
    return null;
  }

  const label =
    daysRemaining > 30
      ? `Cobre ${daysRemaining} dias`
      : `Acaba em ${daysRemaining} dias`;

  switch (alertLevel) {
    case 'critical':
      return (
        <View className='flex-row items-center gap-1.5 rounded-full bg-support-danger-bg px-3 py-1.5'>
          <TriangleAlert
            size={14}
            strokeWidth={2}
            color={colors.support.danger.solid}
          />

          <AppText
            size='xs'
            weight='semiBold'
            className='text-support-danger-text'
          >
            {label}
          </AppText>
        </View>
      );

    case 'urgency':
      return (
        <View className='flex-row items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5'>
          <TriangleAlert size={14} strokeWidth={2} color='#C65D00' />

          <AppText size='xs' weight='semiBold' className='text-orange-700'>
            {label}
          </AppText>
        </View>
      );

    case 'attention':
      return (
        <View className='flex-row items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5'>
          <TriangleAlert size={14} strokeWidth={2} color='#A16207' />

          <AppText size='xs' weight='semiBold' className='text-yellow-700'>
            {label}
          </AppText>
        </View>
      );

    case 'info':
    default:
      return (
        <View className='rounded-full bg-support-success-bg px-3 py-1.5'>
          <AppText
            size='xs'
            weight='semiBold'
            className='text-support-success-text'
          >
            {label}
          </AppText>
        </View>
      );
  }
}
