import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useRegister } from '@/features/auth/hooks';
import {
  signUpSchema,
  type SignUpFormData,
} from '@/features/auth/schemas/sign-up.schema';
import { useAuthStore } from '@/features/auth/stores';
import { authTokenStorage } from '@/infrastructure/storage';

export function useSignUpViewModel() {
  const router = useRouter();

  const registerMutation = useRegister();

  const authenticate = useAuthStore((state) => state.authenticate);

  const {
    control,
    handleSubmit,
    setFocus,
    trigger,
    formState: { isValid, isSubmitting, touchedFields },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',

    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const password = useWatch({
    control,
    name: 'password',
  });

  useEffect(() => {
    if (touchedFields.passwordConfirmation) {
      trigger('passwordConfirmation');
    }
  }, [password, touchedFields.passwordConfirmation, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    const result = await registerMutation.mutateAsync(data);

    await authTokenStorage.saveSession(result.session);

    authenticate(result.user);

    router.replace('/preparing');
  });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return {
    control,
    setFocus,

    onSubmit,
    goBack,

    isValid,
    isSubmitting: isSubmitting || registerMutation.isPending,

    isError: registerMutation.isError,
    error: registerMutation.error,
  };
}
