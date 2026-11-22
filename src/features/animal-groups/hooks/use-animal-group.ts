import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroup(localId: string) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    networkMode: 'always',

    queryKey: animalGroupQueryKeys.detail(accountId ?? '', localId),

    queryFn: () => animalGroupRepository.findById(accountId!, localId),

    enabled: Boolean(accountId && localId),
  });
}
