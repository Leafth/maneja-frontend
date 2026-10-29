import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import type { AnimalGroup } from '@/features/animal-groups/models';
import { terrainQueryKeys } from '@/features/terrains/hooks';
import type { Terrain } from '@/features/terrains/models';
import { terrainSyncService } from '@/features/terrains/services/terrain-sync.service';

import { occupationService } from '../services/occupation.service';

interface MoveAnimalGroupData {
  group: AnimalGroup;
  terrain: Terrain;
}

export function useMoveAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ group, terrain }: MoveAnimalGroupData) => {
      if (!group.remoteId) {
        throw new Error('O grupo ainda não foi sincronizado com o servidor.');
      }

      if (!terrain.remoteId) {
        throw new Error('O terreno ainda não foi sincronizado com o servidor.');
      }

      return occupationService.move(group.remoteId, terrain.remoteId);
    },

    onSuccess: async () => {
      try {
        await terrainSyncService.pull();
      } catch (error) {
        console.error('Erro ao atualizar terrenos após movimentação:', error);
      }

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
