import { scaledToNumber } from '../utils/feed-decimal';
import { useFeedRequirements } from './use-feed-requirements';
import { useFeedingAccount } from './use-feeding-account';
import { useFeeds } from './use-feeds';

export function useFeedRequirementItems(
  groupLocalId: string,
  animalCount: number,
) {
  const account = useFeedingAccount();
  const requirementsQuery = useFeedRequirements(
    account.accountId,
    groupLocalId,
  );
  const feedsQuery = useFeeds(account.accountId);
  const feeds = feedsQuery.data ?? [];
  const requirements = requirementsQuery.data ?? [];

  const items = requirements
    .filter(
      (item) => item.syncStatus !== 'pending_delete' && !item.locallyDeletedAt,
    )
    .map((item) => {
      const feed = feeds.find((feed) => feed.localId === item.feedLocalId);

      return {
        ...item,

        name: feed?.name ?? 'Ração indisponível',

        quantityPerAnimal: scaledToNumber(
          item.quantityPerAnimalScaled,
        ).toLocaleString('pt-BR'),

        dailyTotal: scaledToNumber(
          item.quantityPerAnimalScaled * animalCount,
        ).toLocaleString('pt-BR'),

        dailyRequiredScaled: feed?.dailyRequiredScaled ?? null,

        daysRemaining: feed?.daysRemaining ?? null,

        alertLevel: feed?.alertLevel ?? null,

        canEdit: !['sending', 'uncertain', 'conflict'].includes(
          item.dispatchState,
        ),
      };
    });

  return {
    accountId: account.accountId,
    feeds,
    requirements,
    items,
    isLoading:
      account.isLoading || requirementsQuery.isLoading || feedsQuery.isLoading,
    hasError:
      account.isError || requirementsQuery.isError || feedsQuery.isError,
    retry: () => {
      void requirementsQuery.refetch();
      void feedsQuery.refetch();
    },
  };
}
