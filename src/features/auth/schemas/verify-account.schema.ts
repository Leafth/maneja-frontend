import { z } from 'zod';

export const verifyAccountSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Informe o código')
    .length(6, 'O código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'O código deve conter apenas números'),
});

export type VerifyAccountFormData = z.infer<typeof verifyAccountSchema>;
