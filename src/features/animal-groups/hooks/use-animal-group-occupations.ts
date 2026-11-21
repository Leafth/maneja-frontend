import { useQuery } from '@tanstack/react-query';

import type { AnimalGroupOccupation } from '../models';
import { animalGroupQueryKeys } from './animal-group.query-keys';
import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

export function useAnimalGroupOccupations(localId: string) {
  return useQuery({
    queryKey: animalGroupQueryKeys.occupations(localId),

    queryFn: async (): Promise<AnimalGroupOccupation[]> => {
      const occupations =
        await occupationRepository.findByGroupLocalId(localId);

      return occupations.map(occupationRepository.toAnimalGroupOccupation);
    },

    enabled: Boolean(localId),
  });
}
