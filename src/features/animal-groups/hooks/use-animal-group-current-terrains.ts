import { useQuery } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import type { AnimalGroupTerrainRef } from '../models';
import { animalGroupQueryKeys } from './animal-group.query-keys';

/** Terreno atual de cada grupo, indexado pelo localId. */
export function useAnimalGroupCurrentTerrains(localIds: string[]) {
  return useQuery({
    networkMode: 'always',
    queryKey: animalGroupQueryKeys.currentTerrains(localIds),

    queryFn: async (): Promise<Record<string, AnimalGroupTerrainRef | null>> => {
      // TODO(integração): current_terrain de GET /groups
      // (AnimalGroupDetailsResponseDTO) → animalGroupMapper.fromTerrainRefDTO.
      return integrationPending(`terreno atual de ${localIds.length} grupo(s)`);
    },

    enabled: localIds.length > 0,
  });
}
