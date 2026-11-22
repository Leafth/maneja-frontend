import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

import type { AnimalGroupOccupation } from '../models';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroupOccupations(localId: string) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: animalGroupQueryKeys.occupations(accountId ?? '', localId),

    queryFn: async (): Promise<AnimalGroupOccupation[]> => {
      const occupations =
        await occupationRepository.findByGroupLocalId(localId);

      return occupations
        .filter((occupation) => occupation.accountId === accountId)
        .map(occupationRepository.toAnimalGroupOccupation);
    },

    enabled: Boolean(accountId && localId),
  });
}
