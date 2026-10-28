import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useAnimalGroups } from '@/features/animal-groups/hooks';

import { formatAnimalCount } from '../utils/format-animal-count';

export function useSelectGroupViewModel() {
  const router = useRouter();

  const { terrainId: routeTerrainId } = useLocalSearchParams<{
    terrainId?: string | string[];
  }>();

  const terrainId =
    typeof routeTerrainId === 'string' ? routeTerrainId : '';

  const groupsQuery = useAnimalGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? []).map((group) => ({
        value: group.localId,
        label: `${group.name} (${formatAnimalCount(group.animalCount)})`,
      })),
    [groupsQuery.data],
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (terrainId) {
      router.replace({
        pathname: '/terrain/[terrainId]',
        params: { terrainId },
      });
    } else {
      router.replace('/terrains');
    }
  }

  function handleSubmit() {
    if (!selectedGroupId || !terrainId) { return; }

    router.push({
      pathname: '/movement/confirm',
      params: {
        groupId: selectedGroupId,
        terrainId,
        origin: 'terrain',
      },
    });
  }

  return {
    groupOptions,
    selectedGroupId,
    setSelectedGroupId,

    isLoading: groupsQuery.isPending,
    error: groupsQuery.error,
    isUnavailable: !terrainId,

    canSubmit: Boolean(selectedGroupId && terrainId),

    retry: () => {
      void groupsQuery.refetch();
    },

    goBack,
    handleSubmit,
  };
}
