import { useQuery } from '@tanstack/react-query';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

export function useFeed(
  accountId: string | undefined,
  localId: string | undefined,
) {
  return useQuery({
    queryKey:
      accountId && localId
        ? feedQueryKeys.detail(accountId, localId)
        : feedQueryKeys.details(),

    queryFn: async () => {
      if (!accountId || !localId) {
        return null;
      }

      const feed = await feedRepository.findByLocalId(accountId, localId);

      if (feed?.syncStatus === 'pending_delete' || feed?.locallyDeletedAt) {
        return null;
      }

      return feed;
    },

    enabled: Boolean(accountId && localId),
    networkMode: 'always',
  });
}
