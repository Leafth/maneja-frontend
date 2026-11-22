import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';
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

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    networkMode: 'always',

    mutationFn: ({ localId, data }: UpdateAnimalGroupVariables) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return animalGroupRepository.update(accountId, localId, data);
    },

    onSuccess: async (group) => {
      if (!accountId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.lists(accountId),
        }),

        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.detail(accountId, group.localId),
        }),
      ]);

      void syncOrchestrator.sync(accountId);
    },
  });
}
