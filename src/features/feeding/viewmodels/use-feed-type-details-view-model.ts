import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  useFeed,
  useFeedingAccount,
  useFeedMovements,
  useFeedSyncState,
} from '../hooks';
import { scaledToNumber } from '../utils/feed-decimal';

export function useFeedTypeDetailsViewModel() {
  const router = useRouter();

  const { typeId } = useLocalSearchParams<{
    typeId?: string;
  }>();

  const localId = typeof typeId === 'string' ? typeId : undefined;

  const { accountId, isLoading: isAccountLoading } = useFeedingAccount();

  const feedQuery = useFeed(accountId, localId);

  const movementsQuery = useFeedMovements(accountId, localId);

  const syncStateQuery = useFeedSyncState(accountId, localId);

  const feed = feedQuery.data;

  const type = feed
    ? {
        id: feed.localId,
        name: feed.name,
        availableKg: scaledToNumber(feed.projectedStockScaled),
        syncStatus: feed.syncStatus,
        lastSyncError: feed.lastSyncError,
      }
    : undefined;

  return {
    type,

    movements: movementsQuery.data ?? [],

    syncState: syncStateQuery.data,

    isLoading: isAccountLoading || feedQuery.isLoading,

    isError: feedQuery.isError,

    goBack: () => router.back(),

    addEntry: () => {
      if (!localId) {
        return;
      }

      router.push({
        pathname: '/feeding/entry',
        params: {
          typeId: localId,
        },
      });
    },

    addExit: () => {
      if (!localId) {
        return;
      }

      router.push({
        pathname: '/feeding/exit',
        params: {
          typeId: localId,
        },
      });
    },
  };
}
