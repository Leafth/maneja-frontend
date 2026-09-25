import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useForgotPassword, useVerifyPasswordResetCode } from '../hooks';

import {
  verifyPasswordResetCodeSchema,
  type VerifyPasswordResetCodeFormData,
} from '../schemas/verify-password-reset-code.schema';

import { usePasswordResetStore } from '../stores';
import { maskEmail } from '../utils/mask-email';

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
    formState: { isValid, isSubmitting },
  } = useForm<VerifyPasswordResetCodeFormData>({
    resolver: zodResolver(verifyPasswordResetCodeSchema),

    mode: 'onTouched',

    defaultValues: {
      code: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await verifyMutation.mutateAsync(data);

    setResetToken(result.resetToken);

    router.push('/create-new-password');
  });

  const resendCode = async () => {
    if (!email) {
      throw new Error('E-mail de recuperação não encontrado.');
    }

    await resendCodeMutation.mutateAsync({
      email,
    });
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return {
    control,
    onSubmit,
    resendCode,
    goBack,
    maskedEmail,
    isValid,
    isSubmitting: isSubmitting || verifyMutation.isPending,
    isResending: resendCodeMutation.isPending,
    isError: verifyMutation.isError || resendCodeMutation.isError,
    error: verifyMutation.error || resendCodeMutation.error,
  };
}
