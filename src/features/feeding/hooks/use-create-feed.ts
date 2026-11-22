import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

interface CreateFeedInput {
  name: string;
  initialStockScaled: number;
}

export function useCreateFeed(accountId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, initialStockScaled }: CreateFeedInput) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return feedRepository.createLocal({
        accountId,
        name,
        initialStockScaled,
      });
    },

    onSuccess: async () => {
      if (!accountId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: feedQueryKeys.list(accountId),
      });

      void syncOrchestrator.sync(accountId);
    },

    networkMode: 'always',
    retry: false,
  });
}
