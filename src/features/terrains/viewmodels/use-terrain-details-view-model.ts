import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useDeleteTerrain, useTerrain } from '../hooks';

export function useTerrainDetailsViewModel() {
  const router = useRouter();

  const { terrainId: routeTerrainId } = useLocalSearchParams<{
    terrainId?: string | string[];
  }>();

  const terrainId =
    typeof routeTerrainId === 'string' ? routeTerrainId : '';

  const terrainQuery = useTerrain(terrainId || undefined);
  const deleteMutation = useDeleteTerrain();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const terrain = terrainQuery.data ?? null;

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

  function handleEdit() {
    if (isUnavailable || deleteMutation.isPending) { return; }

    router.push({
      pathname: '/terrain/[terrainId]/edit',
      params: { terrainId },
    });
  }

  function handleDelete() {
    if (isUnavailable || deleteMutation.isPending) { return; }

    setIsDeleteModalOpen(true);
  }

  function handleCancelDelete() {
    if (deleteMutation.isPending) { return; }

    setIsDeleteModalOpen(false);
  }

  function handleConfirmDelete() {
    if (
      !terrainId ||
      isUnavailable ||
      deleteMutation.isPending
    ) {
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
  }

  return {
    terrain,
    isLoading: terrainQuery.isPending && Boolean(terrainId),
    loadError: terrainQuery.error,
    isUnavailable,

    isDeleteModalOpen,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    goBack,
    retry,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
