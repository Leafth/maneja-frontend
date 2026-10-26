import { z } from 'zod';

const quantity = z.string().trim()
  .min(1, 'Informe a quantidade')
  .refine((value) => /^\d+(?:[,.]\d{1,2})?$/.test(value) && Number(value.replace(',', '.')) > 0, 'Informe uma quantidade válida');

function parseLocalDate(value: string): Date | null {
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

export const feedTypeSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da ração'),
  initialKg: quantity,
});

export const stockEntrySchema = z.object({
  typeId: z.string().min(1, 'Selecione uma ração'),
  quantityKg: quantity,
  value: quantity,
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Informe a data no formato DD/MM/AAAA')
    .refine((value) => parseLocalDate(value) !== null, 'Informe uma data válida')
    .refine((value) => {
      const date = parseLocalDate(value);
      if (!date) {
        return true;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date <= today;
    }, 'A data não pode ser futura'),
});

export const stockExitSchema = z.object({
  typeId: z.string().min(1, 'Selecione uma ração'),
  quantityKg: quantity,
  reason: z.string().trim().min(1, 'Informe o motivo'),
});

export type FeedTypeFormData = z.infer<typeof feedTypeSchema>;
export type StockEntryFormData = z.infer<typeof stockEntrySchema>;
export type StockExitFormData = z.infer<typeof stockExitSchema>;
