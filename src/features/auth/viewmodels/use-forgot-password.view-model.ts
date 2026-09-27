import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useForgotPassword } from '../hooks';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgot-password.schema';
import { usePasswordResetStore } from '../stores';

export function useForgotPasswordViewModel() {
  const router = useRouter();

  const forgotPasswordMutation = useForgotPassword();

  const setEmail = usePasswordResetStore((state) => state.setEmail);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',

    defaultValues: {
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await forgotPasswordMutation.mutateAsync(data);

    setEmail(data.email);

    router.push('/verify-account');
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

    isSubmitting: isSubmitting || forgotPasswordMutation.isPending,

    isError: forgotPasswordMutation.isError,
    error: forgotPasswordMutation.error,
  };
}
