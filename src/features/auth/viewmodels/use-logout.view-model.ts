import { useRouter } from 'expo-router';

import { useLogout } from '@/features/auth/hooks';
import { useAuthStore } from '@/features/auth/stores';
import { authTokenStorage } from '@/infrastructure/storage';

export function useLogoutViewModel() {
  const router = useRouter();

  const logoutMutation = useLogout();
  const clearAuthState = useAuthStore((state) => state.logout);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      await authTokenStorage.clear();

      clearAuthState();

      router.replace('/');
    }
  };

  return {
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
