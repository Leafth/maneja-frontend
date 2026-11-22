import { useQuery } from '@tanstack/react-query';

import { overviewService } from '../services/overview.service';
import { homeQueryKeys } from './home-query-keys';

export function useOverview(accountId: string | undefined) {
  return useQuery({
    queryKey: homeQueryKeys.overview(accountId ?? ''),

    queryFn: () => overviewService.getOverview(),

    enabled: !!accountId,
  });
}
