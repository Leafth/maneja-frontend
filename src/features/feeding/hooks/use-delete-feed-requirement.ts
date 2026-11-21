import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';
import { feedRequirementRepository } from '../repositories/feed-requirement.repository';
import { feedingQueryKeys } from './feeding-query-keys';

export function useDeleteFeedRequirement(accountId: string | undefined, groupLocalId: string) {
  const client = useQueryClient();
  return useMutation({ networkMode: 'always', retry: false,
    mutationFn: (localId: string) => {
      if (!accountId) {throw new Error('Conta não identificada.');}
      return feedRequirementRepository.markPendingDelete(accountId, localId);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: feedingQueryKeys.requirements(accountId!, groupLocalId) });
      await client.invalidateQueries({ queryKey: feedingQueryKeys.planning(accountId!) });
      void syncOrchestrator.sync(accountId);
    },
  });
}
