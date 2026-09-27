export interface VerifyPasswordResetCodeRequestDTO {
  code: string;
}

export interface VerifyPasswordResetCodeResponseDTO {
  reset_token: string;
}
