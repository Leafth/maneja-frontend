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
    backgroundClass: string;
    textClass: string;
  }
> = {
  available: {
    label: 'Disponível',
    backgroundClass: 'bg-lime-500',
    textClass: 'text-lime-800',
  },
  resting: {
    label: 'Em descanso',
    backgroundClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
  },
  occupied: {
    label: 'Ocupado',
    backgroundClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
};

function TerrainCardComponent({
  terrain,
  onPress,
}: ITerrainCardProps) {
  const { name, restDays, status } = terrain;
  const config = statusConfig[status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${config.label}`}
      className="rounded-[14px] border border-gray-400 bg-white px-5 py-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <AppText size="lg" weight="medium">
            {name}
          </AppText>

          <AppText color="muted" className="mt-1">
            Descanso configurado: {restDays} dias
          </AppText>
        </View>

        <ChevronRight
          size={20}
          color={colors.gray[700]}
        />
      </View>

      <View className="mt-4 flex-row">
        <View
          className={`rounded-full px-3 py-1.5 ${config.backgroundClass}`}
        >
          <AppText
            size="xs"
            weight="medium"
            className={config.textClass}
          >
            {config.label}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

export const TerrainCard = memo(TerrainCardComponent);
