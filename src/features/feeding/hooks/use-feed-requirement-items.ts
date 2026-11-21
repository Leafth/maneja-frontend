import { useFeedingAccount } from './use-feeding-account';
import { useFeedRequirements } from './use-feed-requirements';
import { useFeeds } from './use-feeds';
import { scaledToNumber } from '../utils/feed-decimal';

export function useFeedRequirementItems(groupLocalId: string, animalCount: number) {
  const account = useFeedingAccount();
  const requirementsQuery = useFeedRequirements(account.accountId, groupLocalId);
  const feedsQuery = useFeeds(account.accountId);
  const feeds = feedsQuery.data ?? [];
  const requirements = requirementsQuery.data ?? [];

  const items = requirements
    .filter((item) => item.syncStatus !== 'pending_delete' && !item.locallyDeletedAt)
    .map((item) => ({
      ...item,
      name: feeds.find((feed) => feed.localId === item.feedLocalId)?.name ?? 'Ração indisponível',
      quantityPerAnimal: scaledToNumber(item.quantityPerAnimalScaled).toLocaleString('pt-BR'),
      dailyTotal: scaledToNumber(item.quantityPerAnimalScaled * animalCount).toLocaleString('pt-BR'),
      canEdit: !['sending', 'uncertain', 'conflict'].includes(item.dispatchState),
    }));

  return {
    accountId: account.accountId,
    feeds,
    requirements,
    items,
    isLoading: account.isLoading || requirementsQuery.isLoading || feedsQuery.isLoading,
    hasError: account.isError || requirementsQuery.isError || feedsQuery.isError,
    retry: () => {
      void requirementsQuery.refetch();
      void feedsQuery.refetch();
    },
  };
}
