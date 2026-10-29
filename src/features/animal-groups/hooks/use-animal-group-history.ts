import { useQuery } from '@tanstack/react-query';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';
import type { HistoryItem } from '@/shared/models';

import type { AnimalGroupHistoryKind } from '../models';
import { buildAnimalGroupMovementHistory } from '../utils/build-animal-group-history';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupHistory(
  localId: string,
  kind: AnimalGroupHistoryKind,
) {
  return useQuery({
    queryKey: animalGroupQueryKeys.history(localId, kind),

    queryFn: async (): Promise<HistoryItem[]> => {
      if (kind === 'feeding') {
        return [];
      }

      const occupations =
        await occupationRepository.findByGroupLocalId(localId);

      return buildAnimalGroupMovementHistory(
        occupations.map(occupationRepository.toAnimalGroupOccupation),
      );
    },

    enabled: Boolean(localId),
  });
}
