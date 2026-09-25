import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Informe a nova senha')
      .min(
        PASSWORD_MIN_LENGTH,
        `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
      ),

    passwordConfirmation: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ['passwordConfirmation'],
    error: 'As senhas não coincidem',
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
