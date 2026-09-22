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
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
  RegisterRequestDTO,
  RegisterResponseDTO,
  ResetPasswordRequestDTO,
  UserResponseDTO,
} from "../models/dtos";

export function mapLoginToDTO(login: Login): LoginRequestDTO {
  return {
    user: {
      email: login.email,
      password: login.password,
    },
  };
}

export function mapLoginResponseToAuthSession(
  dto: LoginResponseDTO,
): AuthSession {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
  };
}

export function mapRegisterToDTO(register: Register): RegisterRequestDTO {
  return {
    user: {
      name: register.name,
      email: register.email,
      password: register.password,
      password_confirmation: register.passwordConfirmation,
    },
  };
}

export function mapRegisterResponseToRegisteredUser(
  dto: RegisterResponseDTO,
): RegisteredUser {
  return {
    session: {
      accessToken: dto.access_token,
      refreshToken: dto.refresh_token,
    },

    user: {
      id: dto.user.id,
      name: dto.user.name,
      email: dto.user.email,
    },
  };
}

export function mapUserResponseToUser(dto: UserResponseDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
  };
}

export function mapRefreshTokenToDTO(
  refreshToken: string,
): RefreshTokenRequestDTO {
  return {
    refresh_token: refreshToken,
  };
}

export function mapRefreshResponseToAuthSession(
  dto: RefreshTokenResponseDTO,
): AuthSession {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
  };
}

export function mapForgotPasswordToDTO(
  data: ForgotPassword,
): ForgotPasswordRequestDTO {
  return {
    email: data.email,
  };
}

export function mapResetPasswordToDTO(
  data: ResetPassword,
): ResetPasswordRequestDTO {
  return {
    token: data.token,
    password: data.password,
    password_confirmation: data.passwordConfirmation,
  };
}
