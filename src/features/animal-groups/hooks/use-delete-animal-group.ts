import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useDeleteAnimalGroup() {
  const queryClient = useQueryClient();

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    networkMode: 'always',

    mutationFn: (localId: string) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return animalGroupRepository.remove(accountId, localId);
    },

    onSuccess: async (_, localId) => {
      if (!accountId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: animalGroupQueryKeys.detail(accountId, localId),
      });

      await queryClient.invalidateQueries({
        queryKey: animalGroupQueryKeys.lists(accountId),
      });

      void syncOrchestrator.sync(accountId);
    },
  });
}
