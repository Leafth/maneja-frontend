import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

import { feedMovementRepository } from '../repositories/feed-movement.repository';

import { feedQueryKeys } from './feed-query-keys';

interface CreateFeedEntryInput {
  feedLocalId: string;
  quantityScaled: number;
  valueScaled: number;
  occurredOn: string;
}

export function useCreateFeedEntry(accountId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedLocalId,
      quantityScaled,
      valueScaled,
      occurredOn,
    }: CreateFeedEntryInput) => {
      if (!accountId) {
        throw new Error('Conta não identificada.');
      }

      return feedMovementRepository.createEntryLocal({
        accountId,
        feedLocalId,
        quantityScaled,
        valueScaled,
        occurredOn,
      });
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
          queryKey: feedQueryKeys.detail(accountId, variables.feedLocalId),
        }),

        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.movements(accountId, variables.feedLocalId),
        }),

        queryClient.invalidateQueries({
          queryKey: feedQueryKeys.sync(accountId, variables.feedLocalId),
        }),
      ]);

      void syncOrchestrator.sync(accountId);
    },

    networkMode: 'always',
    retry: false,
  });
}
