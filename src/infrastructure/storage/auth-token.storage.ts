import * as SecureStore from "expo-secure-store";

import type { AuthSession } from "@/features/auth/models";

import { STORAGE_KEYS } from "./storage.keys";

let accessToken: string | null = null;

export const authTokenStorage = {
  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string): void {
    accessToken = token;
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async saveSession(session: AuthSession): Promise<void> {
    accessToken = session.accessToken;

    await SecureStore.setItemAsync(
      STORAGE_KEYS.REFRESH_TOKEN,
      session.refreshToken,
    );
  },

  async clear(): Promise<void> {
    accessToken = null;

    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
