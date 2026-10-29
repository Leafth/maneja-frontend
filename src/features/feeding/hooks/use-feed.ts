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

    queryFn: () => {
      if (!accountId || !localId) {
        return null;
      }

      return feedRepository.findByLocalId(accountId, localId);
    },

    enabled: Boolean(accountId && localId),
    networkMode: 'always',
  });
}
