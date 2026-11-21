import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useFeedRequirementItems } from '@/features/feeding/hooks/use-feed-requirement-items';

import {
  useAnimalGroup,
  useAnimalGroupHistory,
  useAnimalGroupOccupations,
  useDeleteAnimalGroup,
} from '../hooks';
import type { AnimalGroupHistoryKind } from '../models';

export function useGroupViewModel() {
  const router = useRouter();

  const { localId: routeLocalId, history: routeHistory } = useLocalSearchParams<{
    localId?: string | string[];
    history?: string;
  }>();

  const localId = typeof routeLocalId === 'string' ? routeLocalId : '';

  const query = useAnimalGroup(localId);
  const deleteMutation = useDeleteAnimalGroup();
  const occupationsQuery = useAnimalGroupOccupations(localId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const historyKind: AnimalGroupHistoryKind = routeHistory === 'feeding' ? 'feeding' : 'movements';
  const setHistoryKind = (kind: AnimalGroupHistoryKind) => router.setParams({ history: kind });

  const historyQuery = useAnimalGroupHistory(localId, historyKind);

  const currentOccupation =
    occupationsQuery.data?.find((occupation) => !occupation.endedAt) ?? null;

  const group = query.data?.syncStatus === 'pending_delete' ? null : query.data;
  const feedingNeeds = useFeedRequirementItems(localId, group?.animalCount ?? 0);

  const canAct = Boolean(group) && !query.isError && !deleteMutation.isPending;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissTo('/herd');
    }
  }

  function handleUpdate() {
    if (!canAct) {
      return;
    }

    router.push({
      pathname: '/group/[localId]/edit',
      params: { localId },
    });
  }

  function handleDelete() {
    if (!canAct) {
      return;
    }

    deleteMutation.reset();
    setIsDeleteModalOpen(true);
  }

  function handleCancelDelete() {
    if (deleteMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(false);
    deleteMutation.reset();
  }

  function handleConfirmDelete() {
    if (!canAct || !localId) {
      return;
    }

    deleteMutation.mutate(localId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        router.dismissTo('/herd');
      },
    });
  }

  return {
    group,
    feedingNeeds: feedingNeeds.items,
    isFeedingNeedsLoading: feedingNeeds.isLoading,
    hasFeedingNeedsError: feedingNeeds.hasError,
    retryFeedingNeeds: feedingNeeds.retry,
    handleFeedingNeeds: () => {
      if (canAct) { router.push({ pathname: '/group/[localId]/feeding-need', params: { localId } }); }
    },

    currentTerrain: currentOccupation
      ? {
          name: currentOccupation.terrain.name,
          enteredAt: currentOccupation.startedAt,
        }
      : group?.currentTerrainName
        ? {
            name: group.currentTerrainName,
            enteredAt: null,
          }
        : null,
    isCurrentTerrainLoading: occupationsQuery.isPending && Boolean(localId),
    hasCurrentTerrainError: occupationsQuery.isError,

    historyKind,
    setHistoryKind,
    history: historyQuery.data ?? [],
    isHistoryLoading: historyQuery.isPending && Boolean(localId),
    hasHistoryError: historyQuery.isError,
    retryHistory: () => {
      void historyQuery.refetch();
    },

    isLoading: query.isLoading,
    error: query.error,

    deleteError: deleteMutation.error,
    isDeleting: deleteMutation.isPending,
    actionsDisabled: !canAct,

    isDeleteModalOpen,

    retry: () => {
      void query.refetch();
    },

    handleBack,
    handleUpdate,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
