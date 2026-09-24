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
    const accessToken = authTokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
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
