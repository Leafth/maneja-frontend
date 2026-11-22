import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import {
  animalGroupRepository,
  type CreateAnimalGroupData,
} from '../repositories/animal-group.repository';

import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useCreateAnimalGroup() {
  const queryClient = useQueryClient();

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    networkMode: 'always',

    mutationFn: (data: CreateAnimalGroupData) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return animalGroupRepository.create(accountId, data);
    },

    onSuccess: async () => {
      if (!accountId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: animalGroupQueryKeys.lists(accountId),
      });

      void syncOrchestrator.sync(accountId);
    },
  });
}
