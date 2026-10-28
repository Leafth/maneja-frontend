import { useQuery } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import type { AnimalGroupOccupation } from '../models';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupOccupations(localId: string) {
  return useQuery({
    networkMode: 'always',
    queryKey: animalGroupQueryKeys.occupations(localId),

    queryFn: async (): Promise<AnimalGroupOccupation[]> => {
      // TODO(integração): ocupações do grupo
      // (AnimalGroupOccupationListResponseDTO) → animalGroupMapper.fromOccupationDTO.
      return integrationPending(`ocupações do grupo ${localId}`);
    },

    enabled: Boolean(localId),
  });
}
