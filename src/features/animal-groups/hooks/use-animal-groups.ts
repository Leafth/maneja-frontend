import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroups() {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    networkMode: 'always',

    queryKey: animalGroupQueryKeys.list(accountId ?? ''),

    queryFn: () => animalGroupRepository.findAll(accountId!),

    enabled: Boolean(accountId),
  });
}
