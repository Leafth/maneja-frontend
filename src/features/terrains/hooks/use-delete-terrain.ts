import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useDeleteTerrain() {
  const queryClient = useQueryClient();

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (localId: string) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return terrainRepository.remove(accountId, localId);
    },

    networkMode: 'always',

    onSuccess: async (_, localId) => {
      if (!accountId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: terrainQueryKeys.detail(accountId, localId),
      });

      await queryClient.invalidateQueries({
        queryKey: terrainQueryKeys.lists(accountId),
      });

      void syncOrchestrator.sync(accountId);
    },
  });
}
