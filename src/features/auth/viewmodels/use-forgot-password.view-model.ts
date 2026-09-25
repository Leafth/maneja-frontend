import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useForgotPassword } from '../hooks';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgot-password.schema';

export function useForgotPasswordViewModel() {
  const router = useRouter();

  const forgotPasswordMutation = useForgotPassword();

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

    router.push('/');
  });

  return {
    control,
    onSubmit,

    isValid,

    isSubmitting: isSubmitting || forgotPasswordMutation.isPending,

    isError: forgotPasswordMutation.isError,
    error: forgotPasswordMutation.error,
  };
}
