import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do grupo'),

  animalCount: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade de animais')
    .refine((value) => /^\d+$/.test(value), {
      message: 'Informe uma quantidade válida',
    })
    .refine((value) => Number.isSafeInteger(Number(value)), {
      message: 'Informe uma quantidade válida',
    })
    .refine((value) => Number(value) > 0, {
      message: 'A quantidade deve ser maior que zero',
    }),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;
