import { useQuery } from '@tanstack/react-query';

import { feedMovementRepository } from '../repositories/feed-movement.repository';
import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

export function useFeedSyncState(
  accountId: string | undefined,
  feedLocalId: string | undefined,
) {
  return useQuery({
    queryKey:
      accountId && feedLocalId
        ? feedQueryKeys.sync(accountId, feedLocalId)
        : feedQueryKeys.syncStates(),

    queryFn: async () => {
      if (!accountId || !feedLocalId) {
        return null;
      }

      const [feed, movements] = await Promise.all([
        feedRepository.findByLocalId(accountId, feedLocalId),

        feedMovementRepository.findByFeedLocalId(accountId, feedLocalId),
      ]);

      if (!feed) {
        return null;
      }

      const pendingMovements = movements.filter(
        (movement) => movement.syncStatus === 'pending_create',
      );

      const hasUncertainMovement = movements.some(
        (movement) => movement.dispatchState === 'uncertain',
      );

      const hasRejectedMovement = movements.some(
        (movement) => movement.dispatchState === 'rejected',
      );

      const hasSendingMovement = movements.some(
        (movement) => movement.dispatchState === 'sending',
      );

      const hasPendingBalanceReconciliation = movements.some(
        (movement) => movement.balanceState === 'pending',
      );

      const movementErrors = movements
        .map((movement) => movement.lastSyncError)
        .filter((error): error is string => Boolean(error));

      return {
        feedSyncStatus: feed.syncStatus,
        feedLastSyncError: feed.lastSyncError,
        pendingMovementCount: pendingMovements.length,
        hasUncertainMovement,
        hasRejectedMovement,
        hasSendingMovement,
        hasPendingBalanceReconciliation,

        hasPending:
          feed.syncStatus !== 'synced' ||
          pendingMovements.length > 0 ||
          hasPendingBalanceReconciliation,

        hasError: Boolean(feed.lastSyncError) || movementErrors.length > 0,

        movementErrors,
      };
    },

    enabled: Boolean(accountId && feedLocalId),
    networkMode: 'always',
  });
}
