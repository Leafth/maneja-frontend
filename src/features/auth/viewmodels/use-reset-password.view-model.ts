import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useResetPassword } from '../hooks';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/reset-password.schema';
import { usePasswordResetStore } from '../stores';

export function useResetPasswordViewModel() {
  const router = useRouter();

  const resetPasswordMutation = useResetPassword();

  const resetToken = usePasswordResetStore((state) => state.resetToken);

  const clearPasswordReset = usePasswordResetStore(
    (state) => state.clearPasswordReset,
  );

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isValid, isSubmitting, touchedFields },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),

    mode: 'onTouched',

    defaultValues: {
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
    if (!resetToken) {
      throw new Error('Token de redefinição de senha não encontrado.');
    }

    await resetPasswordMutation.mutateAsync({
      resetToken,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation,
    });

    clearPasswordReset();

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
    isSubmitting: isSubmitting || resetPasswordMutation.isPending,
    isError: resetPasswordMutation.isError,
    error: resetPasswordMutation.error,
  };
}
