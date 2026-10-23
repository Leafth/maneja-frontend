import { zodResolver } from '@hookform/resolvers/zod';
import { useNetInfo } from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreateTerrain,
  useTerrain,
  useUpdateTerrain,
} from '../hooks';

import {
  createTerrainSchema,
  type CreateTerrainFormData,
} from '../schemas/create-terrain.schema';

export function useCreateTerrainViewModel() {
  const router = useRouter();
  const network = useNetInfo();

  const { terrainId: routeTerrainId } = useLocalSearchParams<{
    terrainId?: string | string[];
  }>();

  const terrainId =
    typeof routeTerrainId === 'string' ? routeTerrainId : '';

  const isEditing = routeTerrainId !== undefined;

  const terrainQuery = useTerrain(
    isEditing ? terrainId : undefined,
  );

  const createMutation = useCreateTerrain();
  const updateMutation = useUpdateTerrain();

  const mutation = isEditing
    ? updateMutation
    : createMutation;

  const initializedTerrainId = useRef<string | null>(null);

  const terrain = terrainQuery.data;

  const canEdit = Boolean(
    terrainId &&
    terrain &&
    terrain.syncStatus !== 'pending_delete',
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<CreateTerrainFormData>({
    resolver: zodResolver(createTerrainSchema),
    mode: 'onTouched',

    defaultValues: {
      name: '',
      restDays: '',
    },
  });

  useEffect(() => {
    if (
      isEditing &&
      terrain &&
      initializedTerrainId.current !== terrain.localId
    ) {
      reset({
        name: terrain.name,
        restDays: String(terrain.restDays),
      });

      initializedTerrainId.current = terrain.localId;
    }
  }, [isEditing, terrain, reset]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else if (isEditing && terrainId) {
      router.replace({
        pathname: '/terrain/[terrainId]',
        params: { terrainId },
      });
    } else {
      router.replace('/terrains');
    }
  }

  const onSubmit = handleSubmit((data) => {
    if (
      mutation.isPending ||
      (isEditing && (!canEdit || terrainQuery.isError))
    ) {
      return;
    }

    const values = {
      name: data.name.trim(),
      restDays: Number(data.restDays),
    };

    if (isEditing) {
      updateMutation.mutate(
        {
          localId: terrainId,
          data: values,
        },
        {
          onSuccess: goBack,
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: goBack,
      });
    }
  });

  return {
    control,
    onSubmit,
    goBack,

    isEditing,

    isOnline:
      network.isConnected === true &&
      network.isInternetReachable !== false,

    isLoading:
      isEditing && terrainQuery.isPending && Boolean(terrainId),

    isUnavailable:
      isEditing &&
      (!terrainId ||
        (!terrainQuery.isPending &&
          !terrainQuery.isError &&
          !canEdit)),

    loadError: isEditing ? terrainQuery.error : null,

    retry: () => {
      void terrainQuery.refetch();
    },

    error: mutation.error,

    isValid:
      isValid &&
      (!isEditing || (canEdit && !terrainQuery.isError)),

    isSubmitting:
      isSubmitting || mutation.isPending,
  };
}
