import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

interface UpdateFeedInput {
  localId: string;
  name: string;
}

export function useUpdateFeed(accountId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localId, name }: UpdateFeedInput) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return feedRepository.renameLocal(accountId, localId, name);
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
      ]);

      void syncOrchestrator.sync(accountId);
    },

    networkMode: 'always',
    retry: false,
  });
}
