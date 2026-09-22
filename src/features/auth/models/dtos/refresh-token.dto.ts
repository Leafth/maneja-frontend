export interface RefreshTokenResponseDTO {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequestDTO {
  refresh_token: string;
}
