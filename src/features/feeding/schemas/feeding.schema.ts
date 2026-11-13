import { z } from 'zod';

import { stockEntrySchema } from './feed-stock.schema';
import { brDateTimeToIso } from '../utils/feed-date';

export const feedRequirementSchema = z.object({
  feedLocalId: stockEntrySchema.shape.typeId,
  quantityKg: stockEntrySchema.shape.quantityKg,
});

export const registerFeedingSchema = feedRequirementSchema.extend({
  groupLocalId: z.string().min(1, 'Selecione um grupo'),
  date: stockEntrySchema.shape.date,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe o horário no formato HH:mm'),
}).superRefine((values, context) => {
  if (!stockEntrySchema.shape.date.safeParse(values.date).success ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(values.time)) {
    return;
  }

  if (new Date(brDateTimeToIso(values.date, values.time)).getTime() > Date.now()) {
    context.addIssue({ code: 'custom', path: ['time'], message: 'O horário da alimentação não pode ser futuro' });
  }
});

export type FeedRequirementFormData = z.infer<typeof feedRequirementSchema>;
export type RegisterFeedingFormData = z.infer<typeof registerFeedingSchema>;
