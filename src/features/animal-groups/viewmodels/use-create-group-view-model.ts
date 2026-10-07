import { zodResolver } from '@hookform/resolvers/zod';
import { useNetInfo } from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import {
  useAnimalGroup,
  useCreateAnimalGroup,
  useUpdateAnimalGroup,
} from '../hooks';
import {
  createGroupSchema,
  type CreateGroupFormData,
} from '../schemas/create-group.schema';

export function useCreateGroupViewModel() {
  const router = useRouter();
  const { localId: routeLocalId } = useLocalSearchParams<{
    localId?: string | string[];
  }>();
  const localId = typeof routeLocalId === 'string' ? routeLocalId : '';
  const isEditing = routeLocalId !== undefined;
  const groupQuery = useAnimalGroup(localId);
  const createMutation = useCreateAnimalGroup();
  const updateMutation = useUpdateAnimalGroup();
  const mutation = isEditing ? updateMutation : createMutation;
  const network = useNetInfo();
  const initializedLocalId = useRef<string | null>(null);
  const group = groupQuery.data;
  const canEdit = Boolean(localId && group && group.syncStatus !== 'pending_delete');

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onTouched',

    defaultValues: {
      name: '',
      animalCount: '',
    },
  });

  useEffect(() => {
    if (group && initializedLocalId.current !== group.localId) {
      reset({ name: group.name, animalCount: String(group.animalCount) });
      initializedLocalId.current = group.localId;
    }
  }, [group, reset]);

  const onSubmit = handleSubmit((data) => {
    if (mutation.isPending || (isEditing && (!canEdit || groupQuery.isError))) {
      return;
    }

    const values = {
      name: data.name,
      animalCount: Number(data.animalCount),
    };

    if (isEditing) {
      updateMutation.mutate({ localId, data: values }, { onSuccess: goBack });
    } else {
      createMutation.mutate(values, { onSuccess: goBack });
    }
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/herd');
    }
  };

  return {
    control,
    onSubmit,
    goBack,

    isEditing,
    isOnline: network.isConnected === true && network.isInternetReachable !== false,
    isLoading: isEditing && groupQuery.isLoading,
    isUnavailable: isEditing && !groupQuery.isLoading && !groupQuery.isError && !canEdit,
    loadError: isEditing ? groupQuery.error : null,
    retry: () => {
      void groupQuery.refetch();
    },
    error: mutation.error,
    isValid: isValid && (!isEditing || (canEdit && !groupQuery.isError)),
    isSubmitting: isSubmitting || mutation.isPending,
  };
}
