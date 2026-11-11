import { useQuery } from '@tanstack/react-query';
import { feedingGroupRepository } from '../repositories/feeding-group.repository';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedingGroups(accountId: string | undefined) {
  return useQuery({ queryKey: feedingQueryKeys.groups(accountId ?? ''),
    queryFn: () => feedingGroupRepository.list(accountId!), enabled: !!accountId, networkMode: 'always' });
}
