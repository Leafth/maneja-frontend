import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useForgotPassword, useVerifyPasswordResetCode } from '../hooks';

import {
  verifyPasswordResetCodeSchema,
  type VerifyPasswordResetCodeFormData,
} from '../schemas/verify-password-reset-code.schema';

import { usePasswordResetStore } from '../stores';
import { maskEmail } from '../utils/mask-email';

interface ApiErrorResponse {
  errors?: {
    base?: string[];
  };
}

export function useVerifyPasswordResetCodeViewModel() {
  const router = useRouter();

  const verifyMutation = useVerifyPasswordResetCode();
  const resendCodeMutation = useForgotPassword();

  const email = usePasswordResetStore((state) => state.email);

  const maskedEmail = maskEmail(email);

  const setResetToken = usePasswordResetStore((state) => state.setResetToken);

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isValid, isSubmitting },
  } = useForm<VerifyPasswordResetCodeFormData>({
    resolver: zodResolver(verifyPasswordResetCodeSchema),
    mode: 'onChange',

    defaultValues: {
      code: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await verifyMutation.mutateAsync(data);

      setResetToken(result.resetToken);

      router.push('/create-new-password');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      const message =
        axiosError.response?.data?.errors?.base?.[0] ??
        'Código inválido ou expirado.';

      setError('code', {
        type: 'server',
        message,
      });
    }
  });

  const clearCodeError = () => {
    clearErrors('code');
    verifyMutation.reset();
  };

  const resendCode = async () => {
    if (!email || resendCodeMutation.isPending) {
      return;
    }

    try {
      await resendCodeMutation.mutateAsync({
        email,
      });
    } catch {
      // O erro fica disponível pela mutation.
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return {
    control,

    maskedEmail,

    onSubmit,
    resendCode,
    goBack,
    clearCodeError,

    isValid,

    isSubmitting: isSubmitting || verifyMutation.isPending,

    isResending: resendCodeMutation.isPending,

    isError: verifyMutation.isError || resendCodeMutation.isError,

    error: verifyMutation.error || resendCodeMutation.error,
  };
}
