import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useDeleteTerrain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localId: string) => {
      return terrainRepository.remove(localId);
    },

    networkMode: 'always',

    onSuccess: async (_, localId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.lists(),
        }),

        queryClient.removeQueries({
          queryKey: terrainQueryKeys.detail(localId),
        }),
      ]);

      void syncOrchestrator.sync();
    },
  });
}
