import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import {
  createGroupSchema,
  type CreateGroupFormData,
} from '../schemas/create-group.schema';

export function useCreateGroupViewModel() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onTouched',

    defaultValues: {
      name: '',
      quantity: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const group = {
      name: data.name,
      quantity: Number(data.quantity),
    };

    console.log('create group', group);

    router.back();
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return {
    control,
    onSubmit,
    goBack,

    isValid,
    isSubmitting,
  };
}
