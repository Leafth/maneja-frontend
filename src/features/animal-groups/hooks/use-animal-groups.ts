import { useQuery } from '@tanstack/react-query';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useAnimalGroups() {
  return useQuery({
    queryKey: animalGroupQueryKeys.list(),

    queryFn: () => animalGroupRepository.findAll(),
  });
}
