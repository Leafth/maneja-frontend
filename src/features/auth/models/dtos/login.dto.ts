export interface LoginRequestDTO {
  user: {
    email: string;
    password: string;
  };
}

export interface LoginResponseDTO {
  access_token: string;
  refresh_token: string;
}
