import { useMutation } from '@tanstack/react-query';
import type { FeedPlanningRequestDto } from '../dtos/feed-planning.dto';
import { feedPlanningService } from '../services/feed-planning.service';
import { assertFeedingAccount } from '../services/feeding-sync-context';
import { feedingQueryKeys } from './feeding-query-keys';

export function useFeedPlanning(accountId: string | undefined) {
  return useMutation({ mutationKey: feedingQueryKeys.planning(accountId ?? ''), networkMode: 'always', retry: false,
    mutationFn: async (body: FeedPlanningRequestDto) => {
      if (!accountId) {throw new Error('Conta não identificada.');}
      assertFeedingAccount(accountId);
      const result = await feedPlanningService.calculate(body);
      assertFeedingAccount(accountId);
      return { accountId, result };
    },
  });
}
