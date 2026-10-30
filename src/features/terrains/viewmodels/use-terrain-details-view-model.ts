import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  useDeleteTerrain,
  useForceTerrainRestRemoval,
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
  const forceRestMutation = useForceTerrainRestRemoval();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isForceRestModalOpen, setIsForceRestModalOpen] = useState(false);
  // Guardado ao abrir: após a retirada o status muda antes do fade do modal.
  const [forceRestDays, setForceRestDays] = useState<number | null>(null);

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

  // O backend não valida o descanso: a confirmação é a única barreira.
  function handleForceRestRemoval() {
    if (isUnavailable || stateDetails?.status !== 'resting') {
      return;
    }

    setForceRestDays(stateDetails.remainingRestDays);
    forceRestMutation.reset();
    setIsForceRestModalOpen(true);
  }

  function handleCancelForceRest() {
    if (forceRestMutation.isPending) {
      return;
    }

    setIsForceRestModalOpen(false);
  }

  function handleConfirmForceRest() {
    if (!terrainId || forceRestMutation.isPending) {
      return;
    }

    forceRestMutation.mutate(terrainId, {
      onSuccess: () => setIsForceRestModalOpen(false),
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
    showForceRestRemoval: status === 'resting',

    history,
    isHistoryLoading: occupationsQuery.isPending && Boolean(terrainId),
    hasHistoryError: occupationsQuery.isError,
    retryHistory,

    isLoading:
      (terrainQuery.isPending || stateQuery.isPending) && Boolean(terrainId),
    loadError: terrainQuery.error ?? stateQuery.error,
    isUnavailable,

    remainingRestDays: forceRestDays,
    isForceRestModalOpen,
    isForcingRest: forceRestMutation.isPending,
    forceRestError: forceRestMutation.error,

    isDeleteModalOpen,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    goBack,
    retry,
    handleAllocateGroup,
    handleForceRestRemoval,
    handleCancelForceRest,
    handleConfirmForceRest,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
}
