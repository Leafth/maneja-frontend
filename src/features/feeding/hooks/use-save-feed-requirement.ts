import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';
import { feedRequirementRepository } from '../repositories/feed-requirement.repository';
import { ensureFeedingGroup } from '../services/feeding-sync-context';
import { feedingQueryKeys } from './feeding-query-keys';

export function useSaveFeedRequirement(accountId: string | undefined, groupLocalId: string) {
  const client = useQueryClient();
  return useMutation({ networkMode: 'always', retry: false,
    mutationFn: async (input: { localId?: string; feedLocalId: string; quantityPerAnimalScaled: number }) => {
      if (!accountId) {throw new Error('Conta não identificada.');}
      await ensureFeedingGroup(accountId, groupLocalId);
      return input.localId ? feedRequirementRepository.updateLocal(accountId, input.localId, input)
        : feedRequirementRepository.createLocal({ ...input, accountId, groupLocalId }).then(() => {});
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: feedingQueryKeys.requirements(accountId!, groupLocalId) });
      await client.invalidateQueries({ queryKey: feedingQueryKeys.planning(accountId!) });
      void syncOrchestrator.sync(accountId);
    },
  });
}
