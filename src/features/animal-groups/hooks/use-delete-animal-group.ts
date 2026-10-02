import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupQueryKeys } from './animal-group.query-keys';

export function useDeleteAnimalGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localId: string) => animalGroupRepository.remove(localId),

    onSuccess: async (_, localId) => {
      queryClient.removeQueries({
        queryKey: animalGroupQueryKeys.detail(localId),
      });

      await queryClient.invalidateQueries({
        queryKey: animalGroupQueryKeys.lists(),
      });

      void syncOrchestrator.sync();
    },
  });
}
