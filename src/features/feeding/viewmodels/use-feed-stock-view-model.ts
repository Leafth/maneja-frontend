import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useFeedingAccount, useFeeds } from '../hooks';
import { scaledToNumber } from '../utils/feed-decimal';

export function useFeedStockViewModel() {
  const router = useRouter();
  const network = useNetInfo();

  const [section, setSection] = useState<'stock' | 'planning'>('stock');

  const { accountId, isLoading: isAccountLoading } = useFeedingAccount();

  const feedsQuery = useFeeds(accountId);

  const types = (feedsQuery.data ?? []).map((feed) => ({
    id: feed.localId,
    name: feed.name,
    availableKg: scaledToNumber(feed.projectedStockScaled),
    syncStatus: feed.syncStatus,
    lastSyncError: feed.lastSyncError,
  }));

  return {
    types,
    section,
    setSection,

    isLoading: isAccountLoading || feedsQuery.isLoading,

    isError: feedsQuery.isError,

    retry: () => {
      void feedsQuery.refetch();
    },

    isOnline:
      network.isConnected === true && network.isInternetReachable !== false,

    openType: (typeId: string) =>
      router.push({
        pathname: '/feeding/[typeId]' as never,
        params: { typeId },
      }),

    createType: () => router.push('/feeding/types/create'),
  };
}
