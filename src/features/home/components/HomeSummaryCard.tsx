import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

interface HomeSummaryCardProps {
  title: string;
  value: number;
  description: string;
}

export function HomeSummaryCard({
  title,
  value,
  description,
}: HomeSummaryCardProps) {
  return (
    <View className='flex-1 rounded-2xl border border-neutral-border bg-white p-4'>
      <AppText weight='semiBold' className='text-neutral-textMuted'>
        {title}
      </AppText>

      <AppText
        size='3xl'
        weight='semiBold'
        className='mt-4 text-neutral-textHead'
      >
        {value}
      </AppText>

      <AppText weight='semiBold' className='mt-4 text-neutral-textMuted'>
        {description}
      </AppText>
    </View>
  );
}
