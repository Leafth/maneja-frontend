import { useQuery } from '@tanstack/react-query';
import { feedingRepository } from '../repositories/feeding.repository';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedingHistory(accountId: string | undefined, groupLocalId: string, enabled = true) {
  return useQuery({ queryKey: feedingQueryKeys.history(accountId ?? '', groupLocalId),
    queryFn: () => feedingRepository.findByGroupLocalId(accountId!, groupLocalId),
    enabled: enabled && !!accountId && !!groupLocalId, networkMode: 'always' });
}
