import { useEffect } from 'react';

import { sessionLifecycle } from '@/infrastructure/auth/session-lifecycle';
import { authTokenStorage } from '@/infrastructure/storage';

import { authService } from '../services';
import { useAuthStore } from '../stores';

const RESTORE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('restore-timeout')), ms),
    ),
  ]);
}

export function useRestoreSession() {
  const authenticate = useAuthStore((state) => state.authenticate);

  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        sessionLifecycle.beginSession();

        const refreshToken = await authTokenStorage.getRefreshToken();

        if (!refreshToken) {
          if (!cancelled) {
            logout();
          }

          return;
        }

        const user = await withTimeout(authService.me(), RESTORE_TIMEOUT_MS);

        if (!cancelled) {
          authenticate(user);
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      }
    }

    void restore();

    return () => {
      cancelled = true;
    };
  }, [authenticate, logout]);
}
