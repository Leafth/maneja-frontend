import type { HistoryItem } from '@/shared/models';
import { formatDate, formatDateRange } from '@/shared/utils/format-date';

import type { AnimalGroupOccupation } from '../models';

function formatPeriod(startedAt: string, endedAt: string | null): string {
  return endedAt
    ? formatDateRange(startedAt, endedAt)
    : `Desde ${formatDate(startedAt)}`;
}

export function buildAnimalGroupMovementHistory(
  occupations: AnimalGroupOccupation[],
): HistoryItem[] {
  return [...occupations]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((occupation) => ({
      id: occupation.remoteId ?? occupation.localId,
      title: `Alocado em ${occupation.terrain.name}`,
      period: formatPeriod(occupation.startedAt, occupation.endedAt),
    }));
}
