import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import {
  animalGroupRepository,
  type CreateAnimalGroupData,
} from '../repositories/animal-group.repository';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useCreateAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    networkMode: 'always',
    mutationFn: (data: CreateAnimalGroupData) =>
      animalGroupRepository.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: animalGroupQueryKeys.lists(),
      });

      void syncOrchestrator.sync();
    },
  });
}
