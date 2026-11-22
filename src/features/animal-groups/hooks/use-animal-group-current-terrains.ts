import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import type { AnimalGroupTerrainRef } from '../models';
import { animalGroupRepository } from '../repositories/animal-group.repository';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupCurrentTerrains(localIds: string[]) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: animalGroupQueryKeys.currentTerrains(accountId ?? '', localIds),

    queryFn: async (): Promise<
      Record<string, AnimalGroupTerrainRef | null>
    > => {
      const result: Record<string, AnimalGroupTerrainRef | null> = {};

      for (const localId of localIds) {
        const group = await animalGroupRepository.findById(accountId!, localId);

        if (!group || !group.currentTerrainName) {
          result[localId] = null;
          continue;
        }

        result[localId] = {
          localId: group.currentTerrainLocalId,

          remoteId: group.currentTerrainRemoteId,

          name: group.currentTerrainName,
        };
      }

      return result;
    },

    enabled: Boolean(accountId) && localIds.length > 0,
  });
}
