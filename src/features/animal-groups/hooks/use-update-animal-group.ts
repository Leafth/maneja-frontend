import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import {
  animalGroupRepository,
  type UpdateAnimalGroupData,
} from '../repositories/animal-group.repository';

import { animalGroupQueryKeys } from './animal-group.query-keys';

interface UpdateAnimalGroupVariables {
  localId: string;
  data: UpdateAnimalGroupData;
}

export function useUpdateAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localId, data }: UpdateAnimalGroupVariables) =>
      animalGroupRepository.update(localId, data),

    onSuccess: async (group) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.detail(group.localId),
        }),
      ]);

      void syncOrchestrator.sync();
    },
  });
}
