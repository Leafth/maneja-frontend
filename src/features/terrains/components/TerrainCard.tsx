import { ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import type { Terrain } from '../models/terrain.model';

interface ITerrainCardProps {
  terrain: Terrain;
  onPress: () => void;
}

const statusConfig: Record<
  Terrain['status'],
  {
    label: string;
    badgeClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  available: {
    label: 'Disponível',
    badgeClass: 'bg-support-success-bg border-support-success-border',
    textClass: 'text-support-success-text',
    dotClass: 'bg-support-success-solid',
  },
  resting: {
    label: 'Em descanso',
    badgeClass: 'bg-support-warning-bg border-support-warning-border',
    textClass: 'text-support-warning-text',
    dotClass: 'bg-support-warning-solid',
  },
  occupied: {
    label: 'Ocupado',
    badgeClass: 'bg-support-danger-bg border-support-danger-border',
    textClass: 'text-support-danger-text',
    dotClass: 'bg-support-danger-solid',
  },
};

function TerrainCardComponent({ terrain, onPress }: ITerrainCardProps) {
  const { name, restDays, status } = terrain;
  const config = statusConfig[status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={`${name}, ${config.label}`}
      className='flex-row items-center rounded-[14px] border border-neutral-border bg-neutral-card px-5 py-4 active:opacity-80'
    >
      <View className='mr-3 flex-1'>
        <View className='flex-row items-center gap-2'>
          <View className='shrink'>
            <AppText
              size='lg'
              weight='medium'
              className='text-neutral-textHead'
              numberOfLines={1}
            >
              {name}
            </AppText>
          </View>

          <View
            className={`shrink-0 flex-row items-center gap-1.5 rounded-full border px-2.5 py-1 ${config.badgeClass}`}
          >
            <AppText size='xs' weight='medium' className={config.textClass}>
              {config.label}
            </AppText>
          </View>
        </View>

        <AppText size='sm' className='mt-1 text-neutral-textMuted'>
          Descanso configurado: {restDays} dias
        </AppText>
      </View>

      <ChevronRight size={20} color={colors.neutral.textMuted} />
    </Pressable>
  );
}

export const TerrainCard = memo(TerrainCardComponent);
