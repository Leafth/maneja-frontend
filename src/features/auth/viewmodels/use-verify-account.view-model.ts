import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import {
  verifyAccountSchema,
  type VerifyAccountFormData,
} from '../schemas/verify-account.schema';

export function useVerifyAccountViewModel() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<VerifyAccountFormData>({
    resolver: zodResolver(verifyAccountSchema),
    mode: 'onTouched',

    defaultValues: {
      code: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log('verify account', data.code);

    router.push('/create-new-password');
  });

  const resendCode = async () => {
    console.log('resend code');
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

    isValid,
    isSubmitting,
  };
}
