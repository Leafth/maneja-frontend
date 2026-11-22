import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

interface UpdateTerrainData {
  localId: string;

  data: {
    name?: string;
    restDays?: number;
  };
}

export function useUpdateTerrain() {
  const queryClient = useQueryClient();

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: ({ localId, data }: UpdateTerrainData) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return terrainRepository.update(accountId, localId, data);
    },

    networkMode: 'always',

    onSuccess: async (terrain) => {
      if (!accountId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.lists(accountId),
        }),

        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.detail(accountId, terrain.localId),
        }),

        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.state(accountId, terrain.localId),
        }),

        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.all,
        }),
      ]);

      void syncOrchestrator.sync(accountId);
    },
  });
}
