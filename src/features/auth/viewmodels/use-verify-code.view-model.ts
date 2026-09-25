import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useVerifyPasswordResetCode } from '../hooks';
import {
  verifyPasswordResetCodeSchema,
  type VerifyPasswordResetCodeFormData,
} from '../schemas/verify-password-reset-code.schema';
import { usePasswordResetStore } from '../stores';

export function useVerifyPasswordResetCodeViewModel() {
  const router = useRouter();

  const verifyMutation = useVerifyPasswordResetCode();

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

    router.push('/');
  });

  return {
    control,
    onSubmit,

    isValid,

    isSubmitting: isSubmitting || verifyMutation.isPending,

    isError: verifyMutation.isError,
    error: verifyMutation.error,
  };
}
