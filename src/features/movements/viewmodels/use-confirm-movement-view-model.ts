import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  useAnimalGroup,
  useAnimalGroupCurrentTerrains,
} from '@/features/animal-groups/hooks';
import {
  useTerrain,
  useTerrains,
  useTerrainStateDetails,
} from '@/features/terrains/hooks';

import { useMoveAnimalGroup } from '../hooks';
import type { MovementOrigin } from '../models';

function getParam(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

export function useConfirmMovementViewModel() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    groupId?: string | string[];
    terrainId?: string | string[];
    origin?: string | string[];
    forced?: string | string[];
  }>();

  const groupId = getParam(params.groupId);
  const terrainId = getParam(params.terrainId);
  const origin: MovementOrigin =
    getParam(params.origin) === 'terrain' ? 'terrain' : 'group';
  const isForced = getParam(params.forced) === 'true';

  const groupQuery = useAnimalGroup(groupId);
  const destinationQuery = useTerrain(terrainId || undefined);
  const destinationStateQuery = useTerrainStateDetails(terrainId || undefined);
  const currentTerrainsQuery = useAnimalGroupCurrentTerrains(
    groupId ? [groupId] : [],
  );
  const terrainsQuery = useTerrains();
  const moveMutation = useMoveAnimalGroup();

  const group =
    groupQuery.data?.syncStatus === 'pending_delete' ? null : groupQuery.data;
  const destination =
    destinationQuery.data?.syncStatus === 'pending_delete'
      ? null
      : destinationQuery.data;

  const currentTerrains = currentTerrainsQuery.data;
  const originRef = currentTerrains ? (currentTerrains[groupId] ?? null) : undefined;

  // O ref do grupo traz só id e nome; o período de descanso vem do terreno local.
  const originTerrain = originRef
    ? (terrainsQuery.data ?? []).find(
        (terrain) =>
          terrain.localId === originRef.remoteId ||
          terrain.remoteId === originRef.remoteId,
      )
    : undefined;

  // Terreno em descanso só é aceito quando o usuário forçou a seleção.
  // O backend não valida o descanso: essa regra existe só no frontend.
  const destinationStatus = destinationStateQuery.data?.status;
  const isDestinationAvailable =
    destinationStatus === 'available' ||
    (isForced && destinationStatus === 'resting');

  const hasIds = Boolean(groupId && terrainId);

  function returnToOrigin() {
    if (origin === 'terrain') {
      router.dismissTo({
        pathname: '/terrain/[terrainId]',
        params: { terrainId },
      });
    } else {
      router.dismissTo('/herd');
    }
  }

  function handleConfirm() {
    if (
      !group ||
      !destination ||
      !isDestinationAvailable ||
      moveMutation.isPending
    ) {
      return;
    }

    moveMutation.mutate(
      { group, terrain: destination },
      { onSuccess: returnToOrigin },
    );
  }

  function handleCancel() {
    if (moveMutation.isPending) { return; }

    if (router.canGoBack()) {
      router.back();
    } else {
      returnToOrigin();
    }
  }

  return {
    group,
    destination,
    originName: originRef === undefined ? undefined : (originRef?.name ?? null),
    originRestDays: originTerrain?.restDays ?? null,
    isDestinationAvailable,

    isLoading:
      hasIds &&
      (groupQuery.isPending ||
        destinationQuery.isPending ||
        destinationStateQuery.isPending ||
        currentTerrainsQuery.isPending),
    error:
      groupQuery.error ??
      destinationQuery.error ??
      destinationStateQuery.error ??
      currentTerrainsQuery.error,
    isUnavailable:
      !hasIds ||
      (!groupQuery.isPending && !groupQuery.isError && !group) ||
      (!destinationQuery.isPending && !destinationQuery.isError && !destination),

    isConfirming: moveMutation.isPending,
    confirmError: moveMutation.error,

    retry: () => {
      void groupQuery.refetch();
      void destinationQuery.refetch();
      void destinationStateQuery.refetch();
      void currentTerrainsQuery.refetch();
    },

    handleConfirm,
    handleCancel,
  };
}
