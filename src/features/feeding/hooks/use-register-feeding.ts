import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';
import { feedingRepository } from '../repositories/feeding.repository';
import { feedingQueryKeys } from './feeding-query-keys';
import { feedQueryKeys } from './feed-query-keys';

export function useRegisterFeeding(accountId: string | undefined, groupLocalId: string) {
  const client = useQueryClient();
  return useMutation({ networkMode: 'always', retry: false,
    mutationFn: (input: { feedLocalId: string; quantityScaled: number; occurredAt: string }) => {
      if (!accountId) {throw new Error('Conta não identificada.');}
      return feedingRepository.createLocal({ ...input, accountId, groupLocalId });
    },
    onSuccess: async record => {
      await Promise.all([
        client.invalidateQueries({ queryKey: feedingQueryKeys.history(record.accountId, groupLocalId) }),
        client.invalidateQueries({ queryKey: feedQueryKeys.list(record.accountId) }),
        client.invalidateQueries({ queryKey: feedQueryKeys.detail(record.accountId, record.feedLocalId) }),
        client.invalidateQueries({ queryKey: feedQueryKeys.sync(record.accountId, record.feedLocalId) }),
      ]);
      void syncOrchestrator.sync(accountId);
    },
  });
}
