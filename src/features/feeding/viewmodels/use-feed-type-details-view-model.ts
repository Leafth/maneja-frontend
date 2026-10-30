import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import {
  useDeleteFeed,
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
  const deleteMutation = useDeleteFeed(accountId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const feed = feedQuery.data?.syncStatus === 'pending_delete'
    ? null
    : feedQuery.data;
  const canAct = Boolean(feed && accountId && !feedQuery.isError && !deleteMutation.isPending);

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
    retry: () => {
      void feedQuery.refetch();
    },
    actionsDisabled: !canAct,
    isDeleteModalOpen,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    goBack: () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/feeding');
      }
    },

    handleEdit: () => {
      if (!canAct || !localId) {
        return;
      }

      router.push({
        pathname: '/feeding/[typeId]/edit' as never,
        params: { typeId: localId },
      });
    },

    handleDelete: () => {
      if (!canAct) {
        return;
      }

      deleteMutation.reset();
      setIsDeleteModalOpen(true);
    },

    handleCancelDelete: () => {
      if (deleteMutation.isPending) {
        return;
      }

      setIsDeleteModalOpen(false);
      deleteMutation.reset();
    },

    handleConfirmDelete: () => {
      if (!canAct || !localId) {
        return;
      }

      deleteMutation.mutate({ localId }, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          router.dismissTo('/feeding');
        },
      });
    },

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
