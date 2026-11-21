import { useQuery } from '@tanstack/react-query';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

export function useFeeds(accountId: string | undefined) {
  return useQuery({
    queryKey: accountId ? feedQueryKeys.list(accountId) : feedQueryKeys.lists(),

    queryFn: async () => {
      if (!accountId) {
        return [];
      }

      const feeds = await feedRepository.findAll(accountId);

      return feeds.filter(
        (feed) => feed.syncStatus !== 'pending_delete' && !feed.locallyDeletedAt,
      );
    },

    enabled: Boolean(accountId),
    networkMode: 'always',
  });
}
