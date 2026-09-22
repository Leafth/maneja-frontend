export interface ResetPasswordRequestDTO {
  token: string;
  password: string;
  password_confirmation: string;
}
