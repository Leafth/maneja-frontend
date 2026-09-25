import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail')
    .pipe(z.email('Informe um e-mail válido')),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
