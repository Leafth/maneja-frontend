import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import {
  createNewPasswordSchema,
  type CreateNewPasswordFormData,
} from '../schemas/create-new-password.schema';

export function useCreateNewPasswordViewModel() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<CreateNewPasswordFormData>({
    resolver: zodResolver(createNewPasswordSchema),
    mode: 'onTouched',

    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log('create new password', data);

    router.replace('/');
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
