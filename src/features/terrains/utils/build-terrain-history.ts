import type { HistoryItem } from '@/shared/models';
import { formatDate, formatDateRange } from '@/shared/utils/format-date';

import type { TerrainOccupation } from '../models/terrain-details.model';
import type { TerrainStatus } from '../models/terrain-status.model';

function formatPeriod(startedAt: string, endedAt: string | null): string {
  return endedAt
    ? formatDateRange(startedAt, endedAt)
    : `Desde ${formatDate(startedAt)}`;
}

/**
 * Monta o histórico (mais recente primeiro) a partir das ocupações.
 * Os períodos de descanso são os intervalos entre o fim de uma ocupação e o
 * início da seguinte; o descanso atual só aparece quando o terreno está em descanso.
 */
export function buildTerrainHistory(
  occupations: TerrainOccupation[],
  status: TerrainStatus,
): HistoryItem[] {
  const sorted = [...occupations].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return sorted.flatMap((occupation, index) => {
    const items: HistoryItem[] = [];
    const newerOccupation = sorted[index - 1];

    if (occupation.endedAt && (newerOccupation || status === 'resting')) {
      items.push({
        id: `${occupation.remoteId}-rest`,
        title: 'Em descanso',
        period: formatPeriod(
          occupation.endedAt,
          newerOccupation?.startedAt ?? null,
        ),
      });
    }

    items.push({
      id: occupation.remoteId,
      title: `Ocupado por ${occupation.group.name}`,
      period: formatPeriod(occupation.startedAt, occupation.endedAt),
    });

    return items;
  });
}
