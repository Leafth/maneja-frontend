import { useQuery } from '@tanstack/react-query';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroup(localId: string) {
  return useQuery({
    networkMode: 'always',
    queryKey: animalGroupQueryKeys.detail(localId),

    queryFn: () => animalGroupRepository.findById(localId),

    enabled: Boolean(localId),
  });
}
