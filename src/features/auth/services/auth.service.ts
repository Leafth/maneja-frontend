import { api, refreshApi } from "@/infrastructure/api";

import type {
  AuthSession,
  ForgotPassword,
  Login,
  Register,
  RegisteredUser,
  ResetPassword,
  User,
} from "../models";

import type {
  LoginResponseDTO,
  RefreshTokenResponseDTO,
  RegisterResponseDTO,
  UserResponseDTO,
} from "../models/dtos";

import {
  mapForgotPasswordToDTO,
  mapLoginResponseToAuthSession,
  mapLoginToDTO,
  mapRefreshResponseToAuthSession,
  mapRefreshTokenToDTO,
  mapRegisterResponseToRegisteredUser,
  mapRegisterToDTO,
  mapResetPasswordToDTO,
  mapUserResponseToUser,
} from "../mapper";

export const authService = {
  async login(data: Login): Promise<AuthSession> {
    const dto = mapLoginToDTO(data);

    const response = await api.post<LoginResponseDTO>("/auth/login", dto);

    return mapLoginResponseToAuthSession(response.data);
  },

  async register(data: Register): Promise<RegisteredUser> {
    const dto = mapRegisterToDTO(data);

    const response = await api.post<RegisterResponseDTO>("/auth/register", dto);

    return mapRegisterResponseToRegisteredUser(response.data);
  },

  async me(): Promise<User> {
    const response = await refreshApi.get<UserResponseDTO>("/auth/me");

    return mapUserResponseToUser(response.data);
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const dto = mapRefreshTokenToDTO(refreshToken);

    const response = await api.post<RefreshTokenResponseDTO>(
      "/auth/refresh",
      dto,
    );

    return mapRefreshResponseToAuthSession(response.data);
  },

  async logout(): Promise<void> {
    await api.delete("/auth/logout");
  },

  async forgotPassword(data: ForgotPassword): Promise<void> {
    const dto = mapForgotPasswordToDTO(data);

    await api.post("/password/forgot", dto);
  },

  async resetPassword(data: ResetPassword): Promise<void> {
    const dto = mapResetPasswordToDTO(data);

    await api.patch("/password/reset", dto);
  },
};
