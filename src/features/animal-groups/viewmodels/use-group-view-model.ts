import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useAnimalGroup, useDeleteAnimalGroup } from '../hooks';

export function useGroupViewModel() {
  const router = useRouter();

  const { localId: routeLocalId } = useLocalSearchParams<{
    localId?: string | string[];
  }>();

  const localId =
    typeof routeLocalId === 'string' ? routeLocalId : '';

  const query = useAnimalGroup(localId);
  const deleteMutation = useDeleteAnimalGroup();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const group =
    query.data?.syncStatus === 'pending_delete'
      ? null
      : query.data;

  const canAct =
    Boolean(group) &&
    !query.isError &&
    !deleteMutation.isPending;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissTo('/herd');
    }
  }

  function handleUpdate() {
    if (!canAct) { return; }

    router.push({
      pathname: '/group/[localId]/edit',
      params: { localId },
    });
  }

  function handleDelete() {
    if (!canAct) { return; }

    deleteMutation.reset();
    setIsDeleteModalOpen(true);
  }

  function handleCancelDelete() {
    if (deleteMutation.isPending) { return; }

    setIsDeleteModalOpen(false);
    deleteMutation.reset();
  }

  function handleConfirmDelete() {
    if (!canAct || !localId) { return; }

    deleteMutation.mutate(localId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        router.dismissTo('/herd');
      },
    });
  }

  return {
    group,

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
