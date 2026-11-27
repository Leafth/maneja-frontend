import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

type TerrainStatus = 'available' | 'occupied' | 'resting';

interface HomeTerrainCardProps {
  title: string;
  value: number;
  status: TerrainStatus;
}

function getValueColor(status: TerrainStatus) {
  switch (status) {
    case 'available':
      return colors.support.success.solid;

    case 'occupied':
      return colors.neutral.textHead;

    case 'resting':
      return colors.support.warning.solid;
  }
}

export function HomeTerrainCard({
  title,
  value,
  status,
}: HomeTerrainCardProps) {
  return (
    <View className='flex-1 gap-4 rounded-2xl border border-neutral-border bg-white p-4'>
      <AppText weight='semiBold' className='text-neutral-textMuted text-sm'>
        {title}
      </AppText>

      <AppText
        size='3xl'
        weight='semiBold'
        style={{
          color: getValueColor(status),
        }}
      >
        {value}
      </AppText>
    </View>
  );
}
