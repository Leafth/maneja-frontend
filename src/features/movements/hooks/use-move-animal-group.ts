import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import type { AnimalGroup } from '@/features/animal-groups/models';
import { terrainQueryKeys } from '@/features/terrains/hooks';
import type { Terrain } from '@/features/terrains/models';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { movementCommandRepository } from '../repositories/movement-command.repository';

interface MoveAnimalGroupData {
  accountId: string;
  group: AnimalGroup;
  terrain: Terrain;
}

export function useMoveAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, group, terrain }: MoveAnimalGroupData) => {
      const command = await movementCommandRepository.create({
        accountId,
        groupLocalId: group.localId,
        destinationTerrainLocalId: terrain.localId,
      });

      void syncOrchestrator.sync(accountId).catch((error) => {
        console.error('Erro ao iniciar sincronização da movimentação:', error);
      });

      return command;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: terrainQueryKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: animalGroupQueryKeys.all,
        }),
      ]);
    },
  });
}
