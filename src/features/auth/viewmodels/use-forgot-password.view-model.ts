import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schemas/forgot-password.schema';

export function useForgotPasswordViewModel() {
  const router = useRouter();

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
    console.log('forgot password', data.email);

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
    isSubmitting,
  };
}
