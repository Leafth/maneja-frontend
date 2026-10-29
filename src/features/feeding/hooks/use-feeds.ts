import { useQuery } from '@tanstack/react-query';

import { feedRepository } from '../repositories/feed.repository';

import { feedQueryKeys } from './feed-query-keys';

export function useFeeds(accountId: string | undefined) {
  return useQuery({
    queryKey: accountId ? feedQueryKeys.list(accountId) : feedQueryKeys.lists(),

    queryFn: () => {
      if (!accountId) {
        return [];
      }

      return feedRepository.findAll(accountId);
    },

    enabled: Boolean(accountId),
    networkMode: 'always',
  });
}
