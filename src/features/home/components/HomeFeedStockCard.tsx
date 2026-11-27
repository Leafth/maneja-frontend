import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface HomeFeedStockCardProps {
  name: string;
  stockLabel: string;
  coverage: number;

  alertLevel: 'critical' | 'urgency' | 'attention' | 'info';
}

function getProgressColor(alertLevel: HomeFeedStockCardProps['alertLevel']) {
  switch (alertLevel) {
    case 'critical':
      return colors.support.danger.solid;

    case 'urgency':
      return colors.support.warning.solid;

    case 'attention':
      return colors.support.yellow;

    case 'info':
      return colors.support.success.solid;
  }
}

export function HomeFeedStockCard({
  name,
  stockLabel,
  coverage,
  alertLevel,
}: HomeFeedStockCardProps) {
  const safeCoverage = Math.max(0, Math.min(coverage, 1));

  return (
    <View className='gap-4 rounded-2xl border border-neutral-border bg-white p-4'>
      <View className='flex-row items-center justify-between'>
        <AppText weight='semiBold' className='text-neutral-textMuted'>
          {name}
        </AppText>

        <AppText weight='semiBold' className='text-neutral-textMuted'>
          {stockLabel}
        </AppText>
      </View>

      <View className='h-1 overflow-hidden rounded-full bg-gray-400'>
        <View
          className='h-full rounded-full'
          style={{
            width: `${safeCoverage * 100}%`,
            backgroundColor: getProgressColor(alertLevel),
          }}
        />
      </View>
    </View>
  );
}
