import { useQuery } from '@tanstack/react-query';

import type { AnimalGroupOccupation } from '../models';
import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupService } from '../services/animal-group.service';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupOccupations(localId: string) {
  return useQuery({
    queryKey: animalGroupQueryKeys.occupations(localId),

    queryFn: async (): Promise<AnimalGroupOccupation[]> => {
      const group = await animalGroupRepository.findById(localId);

      if (!group?.remoteId) {
        return [];
      }

      return animalGroupService.listOccupations(group.remoteId);
    },

    enabled: Boolean(localId),
  });
}
