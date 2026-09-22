export interface RegisterRequestDTO {
  user: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  };
}
