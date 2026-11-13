import { useQuery } from '@tanstack/react-query';

import { networkService } from '@/infrastructure/network/network.service';

import { feedingGroupRepository } from '../repositories/feeding-group.repository';
import { assertFeedingAccount, verifyFeedingGroups } from '../services/feeding-sync-context';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedingGroups(accountId: string | undefined) {
  return useQuery({
    queryKey: feedingQueryKeys.groups(accountId ?? ''),
    queryFn: async () => {
      if (!accountId) { return []; }

      assertFeedingAccount(accountId);
      const localGroups = await feedingGroupRepository.list(accountId);

      if (await networkService.isConnected()) {
        try {
          // Grupos antigos podem existir no rebanho sem o vínculo da alimentação.
          // Confirma a conta na API antes de disponibilizá-los no formulário.
          await verifyFeedingGroups(accountId);
        } catch (error) {
          assertFeedingAccount(accountId);
          if (localGroups.length === 0) { throw error; }
          return localGroups;
        }
      }

      assertFeedingAccount(accountId);
      return feedingGroupRepository.list(accountId);
    },
    enabled: !!accountId,
    networkMode: 'always',
  });
}
