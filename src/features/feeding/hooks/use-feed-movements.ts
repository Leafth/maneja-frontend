import { useQuery } from '@tanstack/react-query';

import { feedMovementRepository } from '../repositories/feed-movement.repository';

import { feedQueryKeys } from './feed-query-keys';

export function useFeedMovements(
  accountId: string | undefined,
  feedLocalId: string | undefined,
) {
  return useQuery({
    queryKey:
      accountId && feedLocalId
        ? feedQueryKeys.movements(accountId, feedLocalId)
        : feedQueryKeys.all,

    queryFn: () => {
      if (!accountId || !feedLocalId) {
        return [];
      }

      return feedMovementRepository.findByFeedLocalId(accountId, feedLocalId);
    },

    enabled: Boolean(accountId && feedLocalId),
    networkMode: 'always',
  });
}
