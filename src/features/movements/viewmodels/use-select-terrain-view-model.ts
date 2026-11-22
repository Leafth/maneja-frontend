import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  useAnimalGroup,
  useAnimalGroupCurrentTerrains,
} from '@/features/animal-groups/hooks';
import {
  useTerrains,
  useTerrainsStateDetails,
} from '@/features/terrains/hooks';
import type { TerrainStatus } from '@/features/terrains/models';

const statusOrder: Record<TerrainStatus, number> = {
  available: 0,
  resting: 1,
  occupied: 2,
};

export function useSelectTerrainViewModel() {
  const router = useRouter();

  const { groupId: routeGroupId } = useLocalSearchParams<{
    groupId?: string | string[];
  }>();

  const groupId = typeof routeGroupId === 'string' ? routeGroupId : '';

  const groupQuery = useAnimalGroup(groupId);
  const currentTerrainsQuery = useAnimalGroupCurrentTerrains(
    groupId ? [groupId] : [],
  );
  const terrainsQuery = useTerrains();
  const statesQuery = useTerrainsStateDetails();

  const [forceTarget, setForceTarget] = useState<{
    terrainId: string;
    remainingRestDays: number;
  } | null>(null);
  const [isForceSelectModalOpen, setIsForceSelectModalOpen] = useState(false);

  const group =
    groupQuery.data?.syncStatus === 'pending_delete' ? null : groupQuery.data;

  // Terrenos sem estado carregado ainda ficam de fora até o próximo refetch.
  const terrainOptions = useMemo(() => {
    const states = statesQuery.data ?? {};

    return (terrainsQuery.data ?? [])
      .flatMap((terrain) => {
        const state = states[terrain.localId];

        return state ? [{ terrain, state }] : [];
      })
      .sort((a, b) => statusOrder[a.state.status] - statusOrder[b.state.status]);
  }, [terrainsQuery.data, statesQuery.data]);

  const currentTerrains = currentTerrainsQuery.data;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/herd');
    }
  }

  function goToConfirm(terrainId: string, forced: boolean) {
    router.push({
      pathname: '/movement/confirm',
      params: {
        groupId,
        terrainId,
        origin: 'group',
        ...(forced && { forced: 'true' }),
      },
    });
  }

  function handleSelectTerrain(terrainId: string) {
    if (!group) { return; }

    goToConfirm(terrainId, false);
  }

  // O backend não valida o descanso: a confirmação é a única barreira.
  function handleForceSelect(terrainId: string) {
    const state = statesQuery.data?.[terrainId];

    if (!group || state?.status !== 'resting') { return; }

    setForceTarget({ terrainId, remainingRestDays: state.remainingRestDays });
    setIsForceSelectModalOpen(true);
  }

  // forceTarget é mantido ao fechar para o texto não mudar durante o fade.
  function handleCancelForceSelect() {
    setIsForceSelectModalOpen(false);
  }

  function handleConfirmForceSelect() {
    if (!forceTarget) { return; }

    setIsForceSelectModalOpen(false);
    goToConfirm(forceTarget.terrainId, true);
  }

  return {
    group,
    currentTerrainName: currentTerrains
      ? (currentTerrains[groupId]?.name ?? null)
      : undefined,
    terrainOptions,

    isLoading:
      Boolean(groupId) &&
      (groupQuery.isPending || terrainsQuery.isPending || statesQuery.isPending),
    error: groupQuery.error ?? terrainsQuery.error ?? statesQuery.error,
    isUnavailable:
      !groupId ||
      (!groupQuery.isPending && !groupQuery.isError && !group),

    retry: () => {
      void groupQuery.refetch();
      void terrainsQuery.refetch();
      void statesQuery.refetch();
    },

    forceSelectRemainingDays: forceTarget?.remainingRestDays ?? null,
    isForceSelectModalOpen,

    goBack,
    handleSelectTerrain,
    handleForceSelect,
    handleCancelForceSelect,
    handleConfirmForceSelect,
  };
}
