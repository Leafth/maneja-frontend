import { z } from 'zod';

export const verifyPasswordResetCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'O código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Informe um código válido'),
});

export type VerifyPasswordResetCodeFormData = z.infer<
  typeof verifyPasswordResetCodeSchema
>;
