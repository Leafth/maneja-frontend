import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

export default function FeedOverviewSection() {
  return (
    <View className='mt-6 gap-2'>
      <AppText size='lg' weight='semiBold' className='text-neutral-textHead'>
        Visão geral
      </AppText>

      <AppText className='text-neutral-textMuted'>
        Acompanhe o consumo e a cobertura do estoque das rações.
      </AppText>
    </View>
  );
}
