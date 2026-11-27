import { CircleCheck, TriangleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

type FeedAlertLevel = 'critical' | 'urgency' | 'attention' | 'info';

interface HomeFeedAlertBadgeProps {
  alertLevel: FeedAlertLevel;
  daysRemaining: number;
  stockScaled: number;
}

export function HomeFeedAlertBadge({
  alertLevel,
  daysRemaining,
  stockScaled,
}: HomeFeedAlertBadgeProps) {
  if (stockScaled <= 0) {
    return (
      <View
        className='flex-row items-center gap-1.5 rounded-full px-3 py-2'
        style={{
          backgroundColor: colors.support.danger.solid,
        }}
      >
        <TriangleAlert size={14} strokeWidth={2} color={colors.white} />

        <AppText size='sm' weight='semiBold' color='white'>
          Sem estoque
        </AppText>
      </View>
    );
  }

  const label = `${daysRemaining} dias`;

  switch (alertLevel) {
    case 'critical':
      return (
        <View
          className='flex-row items-center gap-1.5 rounded-full px-3 py-2'
          style={{
            backgroundColor: colors.support.danger.bg,
          }}
        >
          <TriangleAlert
            size={14}
            strokeWidth={2}
            color={colors.support.danger.text}
          />

          <AppText
            size='sm'
            weight='semiBold'
            style={{ color: colors.support.danger.text }}
          >
            {label}
          </AppText>
        </View>
      );

    case 'urgency':
      return (
        <View
          className='flex-row items-center gap-1.5 rounded-full px-3 py-2'
          style={{
            backgroundColor: colors.support.warning.bg,
          }}
        >
          <TriangleAlert
            size={14}
            strokeWidth={2}
            color={colors.support.warning.text}
          />

          <AppText
            size='sm'
            weight='semiBold'
            style={{ color: colors.support.warning.text }}
          >
            {label}
          </AppText>
        </View>
      );

    case 'attention':
      return (
        <View
          className='flex-row items-center gap-1.5 rounded-full px-3 py-2'
          style={{
            backgroundColor: '#FEF3C7',
          }}
        >
          <TriangleAlert size={14} strokeWidth={2} color={'#B45309'} />

          <AppText size='sm' weight='semiBold' style={{ color: '#B45309' }}>
            {label}
          </AppText>
        </View>
      );

    case 'info':
    default:
      return (
        <View
          className='flex-row items-center gap-1.5 rounded-full px-3 py-2'
          style={{
            backgroundColor: colors.support.success.bg,
          }}
        >
          <CircleCheck
            size={14}
            strokeWidth={2}
            color={colors.support.success.text}
          />

          <AppText
            size='sm'
            weight='semiBold'
            style={{ color: colors.support.success.text }}
          >
            {label}
          </AppText>
        </View>
      );
  }
}
