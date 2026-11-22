import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
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

  return useMutation({
    mutationFn: ({ localId, data }: UpdateTerrainData) => {
      return terrainRepository.update(localId, data);
    },

    networkMode: 'always',

    onSuccess: async () => {

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.all,
        }),
      ]);

      void syncOrchestrator.sync();
    },
  });
}
