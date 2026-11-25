import { useMutationState } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useFeedingAccount } from '../hooks';
import { feedingQueryKeys } from '../hooks/feeding-query-keys';
import { useFeedingGroups } from '../hooks/use-feeding-groups';
import type { FeedPlanning } from '../models/feed-planning.model';
import { scaledToKgLabel } from '../utils/feed-decimal';

interface FeedPlanningMutationData {
  accountId: string;
  result: FeedPlanning;
}

export function useFeedPlanningResultViewModel() {
  const router = useRouter();

  const { groupId } = useLocalSearchParams<{
    groupId?: string | string[];
  }>();

  const groupLocalId = typeof groupId === 'string' ? groupId : '';

  const account = useFeedingAccount();

  const groupsQuery = useFeedingGroups(account.accountId);

  const group =
    groupsQuery.data?.find((item) => item.localId === groupLocalId) ?? null;

  const calculated = useMutationState({
    filters: {
      mutationKey: feedingQueryKeys.planning(account.accountId ?? ''),
      status: 'success',
    },

    select: (mutation) =>
      mutation.state.data as FeedPlanningMutationData | undefined,
  });

  const result =
    calculated
      .filter(
        (data): data is FeedPlanningMutationData =>
          data !== undefined &&
          data.accountId === account.accountId &&
          data.result.scope.type === 'group' &&
          data.result.scope.groupRemoteId === group?.remoteId,
      )
      .at(-1)?.result ?? null;

  const items = useMemo(
    () =>
      (result?.items ?? []).map((item) => {
        const isSufficient = item.status.state === 'sufficient';

        const missingScaled =
          item.status.state === 'shortage' ? item.status.missingScaled : 0;

        const remainingScaled =
          item.status.state === 'sufficient' ? item.status.remainingScaled : 0;

        return {
          id: item.feedRemoteId,

          feedName: item.feedName,

          requiredLabel: scaledToKgLabel(item.requiredScaled),

          stockLabel: scaledToKgLabel(item.stockScaled),

          missingLabel: scaledToKgLabel(missingScaled),

          remainingLabel: scaledToKgLabel(remainingScaled),

          coverage:
            item.requiredScaled > 0
              ? Math.min(item.stockScaled / item.requiredScaled, 1)
              : 1,

          sufficient: isSufficient,
        };
      }),
    [result],
  );

  const hasGroupsError = account.isError || groupsQuery.isError;

  return {
    groupName: group?.name ?? '',

    days: result?.period.days ?? 0,

    status: result?.status.state ?? null,

    shortageCount: result?.status.shortageCount ?? 0,

    items,

    isLoading: !hasGroupsError && (account.isLoading || groupsQuery.isLoading),

    hasError: hasGroupsError,

    hasResult: result !== null,

    retry: () => {
      void groupsQuery.refetch();
    },

    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/feeding');
      }
    },
  };
}
