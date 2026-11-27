import { useNetInfo } from '@react-native-community/netinfo';
import { useMemo } from 'react';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useFeedingAccount } from '@/features/feeding/hooks';
import { scaledToKgLabel } from '@/features/feeding/utils/feed-decimal';

import { useOverview } from '../hooks/use-overview';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function useHomeViewModel() {
  const account = useFeedingAccount();

  const user = useAuthStore((state) => state.user);

  const network = useNetInfo();

  const overviewQuery = useOverview(account.accountId);

  const isOnline =
    network.isConnected === true && network.isInternetReachable !== false;

  const overview = overviewQuery.data;

  const feedSummary = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [...overview.feedAlerts]
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3)
      .map((feed) => ({
        id: feed.feedRemoteId,

        name: feed.feedName,

        stockLabel: scaledToKgLabel(feed.stockScaled),

        alertLevel: feed.alertLevel,

        coverage: Math.min(Math.max(feed.daysRemaining / 30, 0), 1),
      }));
  }, [overview]);

  return {
    userName: user?.name ?? '',
    userInitials: user?.name ? getInitials(user.name) : '',

    isOnline,

    groupsCount: overview?.herd.groups ?? 0,
    totalAnimals: overview?.herd.animals ?? 0,

    terrainSummary: {
      available: overview?.terrains.available ?? 0,
      occupied: overview?.terrains.occupied ?? 0,
      resting: overview?.terrains.resting ?? 0,
    },

    feedSummary,

    isLoading: account.isLoading || overviewQuery.isLoading,

    isError: overviewQuery.isError,

    error:
      overviewQuery.error instanceof Error ? overviewQuery.error.message : null,

    retry: overviewQuery.refetch,
  };
}
