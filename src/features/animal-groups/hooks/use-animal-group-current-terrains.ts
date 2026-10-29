import { useQuery } from '@tanstack/react-query';

import type { AnimalGroupTerrainRef } from '../models';
import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupService } from '../services/animal-group.service';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupCurrentTerrains(localIds: string[]) {
  return useQuery({
    queryKey: animalGroupQueryKeys.currentTerrains(localIds),

    queryFn: async (): Promise<
      Record<string, AnimalGroupTerrainRef | null>
    > => {
      const result: Record<string, AnimalGroupTerrainRef | null> = {};

      for (const localId of localIds) {
        const group = await animalGroupRepository.findById(localId);

        if (!group?.remoteId) {
          result[localId] = null;
          continue;
        }

        const response = await animalGroupService.findDetailsById(
          group.remoteId,
        );

        result[localId] = response.currentTerrain;
      }

      return result;
    },

    enabled: localIds.length > 0,
  });
}
