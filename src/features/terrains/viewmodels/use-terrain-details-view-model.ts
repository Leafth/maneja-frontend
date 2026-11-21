import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  useDeleteTerrain,
  useTerrain,
  useTerrainOccupations,
  useTerrainStateDetails,
} from '../hooks';
import { buildTerrainHistory } from '../utils/build-terrain-history';

export function useTerrainDetailsViewModel() {
  const router = useRouter();

  const { terrainId: routeTerrainId } = useLocalSearchParams<{
    terrainId?: string | string[];
  }>();

  const terrainId = typeof routeTerrainId === 'string' ? routeTerrainId : '';

  const terrainQuery = useTerrain(terrainId || undefined);
  const stateQuery = useTerrainStateDetails(terrainId || undefined);
  const occupationsQuery = useTerrainOccupations(terrainId || undefined);
  const deleteMutation = useDeleteTerrain();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const terrain = terrainQuery.data ?? null;
  const stateDetails = stateQuery.data ?? null;
  const status = stateDetails?.status ?? terrain?.status;

  const history = useMemo(
    () =>
      status ? buildTerrainHistory(occupationsQuery.data ?? [], status) : [],
    [occupationsQuery.data, status],
  );

  const isUnavailable =
    !terrainId ||
    (!terrainQuery.isPending &&
      !terrainQuery.isError &&
      (!terrain || terrain.syncStatus === 'pending_delete'));

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/terrains');
    }
  }

  function handleAllocateGroup() {
    if (isUnavailable) {
      return;
    }

    router.push({
      pathname: '/movement/select-group',
      params: { terrainId },
    });
  }

  function handleEdit() {
    if (isUnavailable || deleteMutation.isPending) {
      return;
    }

    router.push({
      pathname: '/terrain/[terrainId]/edit',
      params: { terrainId },
    });
  }

  function handleDelete() {
    if (isUnavailable || deleteMutation.isPending || status === 'occupied') {
      return;
    }

    setIsDeleteModalOpen(true);
  }

  function handleCancelDelete() {
    if (deleteMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!terrainId || isUnavailable || deleteMutation.isPending) {
      return;
    }

    deleteMutation.mutate(terrainId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        router.replace('/terrains');
      },
    });
  }

  function retry() {
    void terrainQuery.refetch();
    void stateQuery.refetch();
  }

  function retryHistory() {
    void occupationsQuery.refetch();
  }

  return {
    terrain,
    stateDetails,
    showAllocateGroup: status === 'available',

    history,
    isHistoryLoading: occupationsQuery.isPending && Boolean(terrainId),
    hasHistoryError: occupationsQuery.isError,
    retryHistory,

    isLoading:
      (terrainQuery.isPending || stateQuery.isPending) && Boolean(terrainId),
    loadError: terrainQuery.error ?? stateQuery.error,
    isUnavailable,

    isDeleteModalOpen,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    goBack,
    retry,
    handleAllocateGroup,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
