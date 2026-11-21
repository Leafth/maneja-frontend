import { z } from 'zod';

export const planningPeriods = ['7', '15', '30', 'custom'] as const;

export type PlanningPeriod = (typeof planningPeriods)[number];

export const feedPlanningSchema = z
  .object({
    period: z.enum(planningPeriods, { message: 'Selecione um período' }),
    customDays: z.string(),
    groupLocalId: z.string().min(1, 'Selecione um grupo'),
  })
  .superRefine((values, context) => {
    if (values.period !== 'custom') {
      return;
    }

    const days = values.customDays.trim();

    if (!/^\d+$/.test(days) || Number(days) <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['customDays'],
        message: 'Informe um número de dias válido',
      });
    }
  });

export type FeedPlanningFormData = z.infer<typeof feedPlanningSchema>;
