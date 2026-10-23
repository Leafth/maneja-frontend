import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

interface CreateTerrainData {
  name: string;
  restDays: number;
}

export function useCreateTerrain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTerrainData) => {
      return terrainRepository.create(data);
    },

    networkMode: 'always',

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: terrainQueryKeys.all,
      });

      void syncOrchestrator.sync();
    },
  });
}
