import { useMutation, useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import type { AnimalGroup } from '@/features/animal-groups/models';
import { terrainQueryKeys } from '@/features/terrains/hooks';
import type { Terrain } from '@/features/terrains/models';
import { integrationPending } from '@/shared/utils/integration-pending';

interface MoveAnimalGroupData {
  group: AnimalGroup;
  terrain: Terrain;
}

export function useMoveAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    // TODO(integração): endpoint de movimentação ainda indefinido (usa ids remotos).
    mutationFn: async ({ group, terrain }: MoveAnimalGroupData): Promise<void> =>
      integrationPending(`mover grupo ${group.localId} para ${terrain.localId}`),

    networkMode: 'always',

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: terrainQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: animalGroupQueryKeys.all }),
      ]);
    },
  });
}
