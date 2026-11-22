import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';

import type { TerrainStatus } from '../models/terrain-status.model';
import { TerrainStatusBadge } from './TerrainStatusBadge';

interface ITerrainSummaryCardProps {
  status: TerrainStatus;
  statusLabel: string;
  restDays: number;
  label?: string;
  title?: string;
  caption?: string;
}

export function TerrainSummaryCard({
  status,
  statusLabel,
  restDays,
  label,
  title,
  caption,
}: ITerrainSummaryCardProps) {
  const hasText = Boolean(label || title || caption);

  return (
    <View className='rounded-[14px] border border-neutral-border bg-neutral-card p-2'>
      <View className='gap-4 rounded-[10px] bg-neutral-surface px-2 py-4'>
        {hasText && (
          <View className='gap-1'>
            {label && (
              <AppText className='text-neutral-textMuted'>{label}</AppText>
            )}

            {title && (
              <AppText weight='medium' className='text-neutral-textHead'>
                {title}
              </AppText>
            )}

            {caption && (
              <AppText className='text-neutral-textMuted'>{caption}</AppText>
            )}
          </View>
        )}

        <View className='flex-row flex-wrap items-center gap-4'>
          <TerrainStatusBadge status={status} label={statusLabel} />

          <View className='rounded-full bg-black-600 px-2.5 py-1'>
            <AppText size='xs' weight='medium' color='white'>
              Descanso: {restDays} dias
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
