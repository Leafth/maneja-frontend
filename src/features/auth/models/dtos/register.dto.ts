export interface RegisterRequestDTO {
  user: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  };
}

export interface RegisterResponseDTO {
  user: {
    id: string;
    name: string;
    email: string;
  };

  access_token: string;
  refresh_token: string;
}
