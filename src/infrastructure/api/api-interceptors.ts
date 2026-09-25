import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { AuthSession } from '@/features/auth/models';
import { authService } from '@/features/auth/services';
import { authTokenStorage } from '@/infrastructure/storage';

import { api } from './api-client';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
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

let refreshPromise: Promise<AuthSession> | null = null;

async function refreshSession(): Promise<AuthSession> {
  const refreshToken = await authTokenStorage.getRefreshToken();

  if (!refreshToken) {
    await authTokenStorage.clear();

    throw new Error('Refresh token não encontrado.');
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = await authService.refresh(refreshToken);

      await authTokenStorage.saveSession(session);

      return session;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    if (isPublicRoute(config.url)) {
      return config;
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
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized) {
      return Promise.reject(error);
    }

    if (isPublicRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const session = await refreshSession();

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);

      originalRequest.headers.set(
        'Authorization',
        `Bearer ${session.accessToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      await authTokenStorage.clear();

      return Promise.reject(refreshError);
    }
  },
);
