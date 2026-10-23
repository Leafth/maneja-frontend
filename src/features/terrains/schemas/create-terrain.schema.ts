import { z } from 'zod';

export const createTerrainSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do terreno.'),

  restDays: z
    .string()
    .min(1, 'Informe o período de descanso.')
    .regex(/^\d+$/, 'Informe um número inteiro válido.')
    .refine(
      (value) => Number.isSafeInteger(Number(value)),
      'Informe um número de dias válido.',
    ),
});

export type CreateTerrainFormData = z.infer<
  typeof createTerrainSchema
>;
