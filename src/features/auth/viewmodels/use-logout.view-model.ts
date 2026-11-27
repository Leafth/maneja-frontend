import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useLogout } from '@/features/auth/hooks';
import { useAuthStore } from '@/features/auth/stores';
import { waitForActiveRefresh } from '@/infrastructure/api/api-interceptors';
import { sessionLifecycle } from '@/infrastructure/auth/session-lifecycle';
import { authTokenStorage } from '@/infrastructure/storage';
import { syncOrchestrator } from '@/infrastructure/sync/sync-orchestrator';

export function useLogoutViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useLogout();

  const clearAuthState = useAuthStore((state) => state.logout);

  const logout = async () => {
    if (sessionLifecycle.isLoggingOut()) {
      return;
    }

    sessionLifecycle.beginLogout();

    try {
      // Suspende novas rodadas e aguarda a atual.
      await syncOrchestrator.suspendAndWait();

      // Aguarda refresh iniciado anteriormente.
      await waitForActiveRefresh();

      try {
        // Revoga a sessão no backend.
        await logoutMutation.mutateAsync();
      } catch {
        // Falha de rede não impede a saída local.
      }
    } finally {
      try {
        // Cancela consultas ainda pendentes.
        await queryClient.cancelQueries();

        // Remove as credenciais armazenadas.
        await authTokenStorage.clear();
      } finally {
        // Limpa o estado autenticado.
        clearAuthState();

        // Remove os dados em memória do TanStack Query.
        queryClient.clear();

        sessionLifecycle.finishLogout();

        router.replace('/');
      }
    }
  };

  return {
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
