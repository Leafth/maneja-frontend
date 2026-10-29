import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

interface DeleteFeedInput {
  localId: string;
}

export function useDeleteFeed(accountId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localId }: DeleteFeedInput) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return feedRepository.markPendingDelete(accountId, localId);
    },

    onSuccess: async (_, variables) => {
      if (!accountId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.list(accountId),
        }),

        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.detail(accountId, variables.localId),
        }),

        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.sync(accountId, variables.localId),
        }),
      ]);

      void syncOrchestrator.sync(accountId);
    },

    networkMode: 'always',
    retry: false,
  });
}
