import {
  AxiosError,
  AxiosHeaders,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { AuthSession } from '@/features/auth/models';
import { authService } from '@/features/auth/services';
import { sessionLifecycle } from '@/infrastructure/auth/session-lifecycle';
import { authTokenStorage } from '@/infrastructure/storage';

import { api } from './api-client';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _sessionGeneration?: number;
}

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/password/forgot',
  '/password/verify',
  '/password/reset',
];

function isPublicRoute(url?: string): boolean {
  if (!url) {
    return false;
  }

  return PUBLIC_ROUTES.some((route) => url.includes(route));
}

function isLogout(url?: string): boolean {
  return url?.includes('/auth/logout') === true;
}

function obsoleteSession(): Error {
  return new Error('Requisição cancelada: sessão encerrada ou alterada.');
}

let refreshPromise: Promise<AuthSession> | null = null;
let refreshGeneration: number | null = null;

export async function waitForActiveRefresh(): Promise<void> {
  if (refreshPromise) {
    await refreshPromise.catch(() => undefined);
  }
}

async function refreshSession(origin: number): Promise<AuthSession> {
  if (!sessionLifecycle.isCurrent(origin)) {
    throw obsoleteSession();
  }

  if (!refreshPromise || refreshGeneration !== origin) {
    refreshGeneration = origin;

    const currentRefresh = (async () => {
      const refreshToken = await authTokenStorage.getRefreshToken();

      if (!sessionLifecycle.isCurrent(origin)) {
        throw obsoleteSession();
      }

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado.');
      }

      const session = await authService.refresh(refreshToken);

      if (!sessionLifecycle.isCurrent(origin)) {
        throw obsoleteSession();
      }

      await authTokenStorage.saveSession(session);

      if (!sessionLifecycle.isCurrent(origin)) {
        throw obsoleteSession();
      }

      return session;
    })();

    refreshPromise = currentRefresh;

    void currentRefresh
      .finally(() => {
        if (refreshPromise === currentRefresh) {
          refreshPromise = null;
        }
      })
      .catch(() => undefined);
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    if (isPublicRoute(config.url)) {
      return config;
    }

    if (sessionLifecycle.isLoggingOut() && !isLogout(config.url)) {
      return Promise.reject(obsoleteSession());
    }

    const request = config as RetryableRequestConfig;

    // Preserva a geração original nos retries.
    request._sessionGeneration ??= sessionLifecycle.getGeneration();

    if (
      !isLogout(config.url) &&
      !sessionLifecycle.isCurrent(request._sessionGeneration)
    ) {
      return Promise.reject(obsoleteSession());
    }

    const accessToken = authTokenStorage.getAccessToken();

    if (accessToken) {
      config.headers = AxiosHeaders.from(config.headers);

      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const config = response.config as RetryableRequestConfig;

    if (!isPublicRoute(config.url) && !isLogout(config.url)) {
      const origin = config._sessionGeneration;

      if (origin === undefined || !sessionLifecycle.isCurrent(origin)) {
        return Promise.reject(obsoleteSession());
      }
    }

    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (
      isPublicRoute(originalRequest.url) ||
      isLogout(originalRequest.url) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const origin = originalRequest._sessionGeneration;

    if (origin === undefined || !sessionLifecycle.isCurrent(origin)) {
      return Promise.reject(obsoleteSession());
    }

    originalRequest._retry = true;

    try {
      const session = await refreshSession(origin);

      if (!sessionLifecycle.isCurrent(origin)) {
        throw obsoleteSession();
      }

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);

      originalRequest.headers.set(
        'Authorization',
        `Bearer ${session.accessToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      const status = isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined;

      if (
        sessionLifecycle.isCurrent(origin) &&
        (status === 400 || status === 401 || status === 403)
      ) {
        await authTokenStorage.clear();
      }

      return Promise.reject(refreshError);
    }
  },
);
