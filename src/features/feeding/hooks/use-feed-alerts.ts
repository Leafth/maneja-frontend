import { useQuery } from '@tanstack/react-query';

import { feedService } from '../services/feed.service';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedAlerts(accountId: string | undefined) {
  return useQuery({
    queryKey: feedingQueryKeys.alerts(accountId ?? ''),

    queryFn: () => feedService.listAlerts(),

    enabled: !!accountId,
  });
}
