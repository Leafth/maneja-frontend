import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useAnimalGroup, useDeleteAnimalGroup } from '../hooks';

export function useGroupViewModel() {
  const router = useRouter();
  const { localId: routeLocalId } = useLocalSearchParams<{
    localId?: string | string[];
  }>();
  const localId = typeof routeLocalId === 'string' ? routeLocalId : '';
  const query = useAnimalGroup(localId);
  const deleteMutation = useDeleteAnimalGroup();
  const group = query.data?.syncStatus === 'pending_delete' ? null : query.data;
  const canAct = Boolean(group) && !query.isError && !deleteMutation.isPending;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/herd');
    }
  }

  function handleUpdate() {
    if (canAct) {
      router.push({ pathname: '/create-group', params: { localId } });
    }
  }

  function handleDelete() {
    if (!canAct) {
      return;
    }

    Alert.alert('Excluir grupo', `Deseja excluir o grupo "${group?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(localId, {
            onSuccess: () => router.replace('/herd'),
          }),
      },
    ]);
  }

  return {
    group,
    isLoading: query.isLoading,
    error: query.error,
    deleteError: deleteMutation.error,
    isDeleting: deleteMutation.isPending,
    actionsDisabled: !canAct,
    retry: () => {
      void query.refetch();
    },
    handleBack,
    handleUpdate,
    handleDelete,
  };
}
