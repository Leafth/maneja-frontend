import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

interface CreateTerrainData {
  name: string;
  restDays: number;
}

export function useCreateTerrain() {
  const queryClient = useQueryClient();

  const accountId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (data: CreateTerrainData) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return terrainRepository.create(accountId, data);
    },

    networkMode: 'always',

    onSuccess: async () => {
      if (!accountId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: terrainQueryKeys.lists(accountId),
      });

      void syncOrchestrator.sync(accountId);
    },
  });
}
