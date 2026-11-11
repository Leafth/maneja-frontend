import { useQuery } from '@tanstack/react-query';
import { feedRequirementRepository } from '../repositories/feed-requirement.repository';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedRequirements(accountId: string | undefined, groupLocalId: string) {
  return useQuery({ queryKey: feedingQueryKeys.requirements(accountId ?? '', groupLocalId),
    queryFn: () => feedRequirementRepository.findByGroupLocalId(accountId!, groupLocalId, true),
    enabled: !!accountId && !!groupLocalId, networkMode: 'always' });
}
