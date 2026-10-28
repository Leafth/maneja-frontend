import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

import type { TerrainStatus } from '../models/terrain-status.model';

/** Rótulos usados no detalhe do terreno e no fluxo de movimentação. */
export const terrainStatusLabels: Record<TerrainStatus, string> = {
  available: 'Disponível',
  resting: 'Em Descanso',
  occupied: 'Em Uso',
};

const statusStyles: Record<
  TerrainStatus,
  { badgeClass: string; textClass: string }
> = {
  available: {
    badgeClass: 'bg-support-success-bg border-support-success-border',
    textClass: 'text-support-success-text',
  },
  resting: {
    badgeClass: 'bg-support-warning-bg border-support-warning-border',
    textClass: 'text-support-warning-text',
  },
  occupied: {
    badgeClass: 'bg-support-danger-bg border-support-danger-border',
    textClass: 'text-support-danger-text',
  },
};

interface ITerrainStatusBadgeProps {
  status: TerrainStatus;
  label: string;
}

export function TerrainStatusBadge({ status, label }: ITerrainStatusBadgeProps) {
  const { badgeClass, textClass } = statusStyles[status];

  return (
    <View
      className={`shrink-0 flex-row items-center rounded-full border px-2.5 py-1 ${badgeClass}`}
    >
      <AppText size='xs' weight='medium' className={textClass}>
        {label}
      </AppText>
    </View>
  );
}
