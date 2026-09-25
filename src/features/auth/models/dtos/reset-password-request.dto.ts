export interface ResetPasswordRequestDTO {
  reset_token: string;
  password: string;
  password_confirmation: string;
}
