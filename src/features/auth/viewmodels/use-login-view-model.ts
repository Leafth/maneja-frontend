import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { useLogin } from '@/features/auth/hooks';
import { authService } from '@/features/auth/services';
import { useAuthStore } from '@/features/auth/stores';
import { authTokenStorage } from '@/infrastructure/storage';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';

export function useLoginViewModel() {
  const router = useRouter();

  const loginMutation = useLogin();

  const authenticate = useAuthStore((state) => state.authenticate);

  const {
    control,
    handleSubmit,
    setFocus,

    formState: { isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',

    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const session = await loginMutation.mutateAsync({
      email: data.email,
      password: data.password,
    });

    await authTokenStorage.saveSession(session);

    const user = await authService.me();

    authenticate(user);

    router.replace('/home');
  });

  return {
    control,
    setFocus,
    onSubmit,

    isValid,

    isSubmitting: isSubmitting || loginMutation.isPending,

    isError: loginMutation.isError,
    error: loginMutation.error,
  };
}
