import { Pressable, View } from 'react-native';

import {
  TerrainStatusBadge,
  terrainStatusLabels,
} from '@/features/terrains/components/TerrainStatusBadge';
import type { Terrain, TerrainStateDetails } from '@/features/terrains/models';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';

interface IMovementTerrainOptionProps {
  terrain: Terrain;
  state: TerrainStateDetails;
  onSelect: () => void;
  onForceSelect: () => void;
}

function getDescription(state: TerrainStateDetails): string {
  switch (state.status) {
    case 'available':
      return 'Disponível para receber grupo';

    case 'resting': {
      const days = state.remainingRestDays;

      return `Indisponível por mais ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }

    case 'occupied':
      return `Ocupado por: ${state.currentGroup.name}`;
  }
}

export function MovementTerrainOption({
  terrain,
  state,
  onSelect,
  onForceSelect,
}: IMovementTerrainOptionProps) {
  const isAvailable = state.status === 'available';

  const content = (
    <View className={`gap-1 ${isAvailable ? '' : 'opacity-40'}`}>
      <View className='flex-row items-center justify-between gap-2'>
        <AppText
          weight='medium'
          className='shrink text-neutral-textHead'
          numberOfLines={1}
        >
          {terrain.name}
        </AppText>

        <TerrainStatusBadge
          status={state.status}
          label={terrainStatusLabels[state.status]}
        />
      </View>

      <AppText size='sm' className='text-neutral-textMuted'>
        {getDescription(state)}
      </AppText>
    </View>
  );

  if (isAvailable) {
    return (
      <Pressable
        onPress={onSelect}
        accessibilityRole='button'
        accessibilityLabel={`${terrain.name}, ${terrainStatusLabels[state.status]}`}
        className='rounded-[14px] border border-neutral-border bg-neutral-card px-4 py-3 active:opacity-80'
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityState={{ disabled: true }}
      className='gap-3 rounded-[14px] bg-gray-400 px-4 py-3'
    >
      {content}

      {state.status === 'resting' && (
        <View className='self-start'>
          <Button variant='dark' size='md' onPress={onForceSelect}>
            Forçar Seleção
          </Button>
        </View>
      )}
    </View>
  );
}
