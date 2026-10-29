import { useQuery } from '@tanstack/react-query';

import type { HistoryItem } from '@/shared/models';

import type { AnimalGroupHistoryKind } from '../models';
import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupService } from '../services/animal-group.service';
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

      const group = await animalGroupRepository.findById(localId);

      if (!group?.remoteId) {
        return [];
      }

      const occupations = await animalGroupService.listOccupations(
        group.remoteId,
      );

      return buildAnimalGroupMovementHistory(occupations);
    },

    enabled: Boolean(localId),
  });
}
