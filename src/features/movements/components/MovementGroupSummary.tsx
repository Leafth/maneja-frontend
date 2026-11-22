import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

import { formatAnimalCount } from '../utils/format-animal-count';

interface IMovementGroupSummaryProps {
  title: string;
  animalCount: number;
  /** undefined: carregando; null: sem alocação. */
  currentTerrainName: string | null | undefined;
}

export function MovementGroupSummary({
  title,
  animalCount,
  currentTerrainName,
}: IMovementGroupSummaryProps) {
  const location =
    currentTerrainName === undefined
      ? null
      : currentTerrainName === null
        ? 'Sem alocação'
        : `Atualmente em ${currentTerrainName}`;

  return (
    <View className='gap-1'>
      <AppText size='lg' className='uppercase tracking-wide text-neutral-textHead'>
        {title}
      </AppText>

      <AppText size='sm' className='text-neutral-textMuted'>
        {formatAnimalCount(animalCount)}
        {location && ` · ${location}`}
      </AppText>
    </View>
  );
}
