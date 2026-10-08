import { zodResolver } from '@hookform/resolvers/zod';
import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useCreateTerrain } from '../hooks';
import {
  createTerrainSchema,
  type CreateTerrainFormData,
} from '../schemas/create-terrain.schema';

export function useCreateTerrainViewModel() {
  const router = useRouter();
  const network = useNetInfo();
  const createMutation = useCreateTerrain();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateTerrainFormData>({
    resolver: zodResolver(createTerrainSchema),
    mode: 'onTouched',

    defaultValues: {
      name: '',
      restDays: '',
    },
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/terrains');
    }
  };

  const onSubmit = handleSubmit((data) => {
    if (createMutation.isPending) {
      return;
    }

    createMutation.mutate(
      {
        name: data.name.trim(),
        restDays: Number(data.restDays),
      },
      {
        onSuccess: goBack,
      },
    );
  });

  return {
    control,
    onSubmit,
    goBack,

    isValid,
    isSubmitting:
      isSubmitting || createMutation.isPending,

    isOnline:
      network.isConnected === true &&
      network.isInternetReachable !== false,

    error: createMutation.error,
  };
}
