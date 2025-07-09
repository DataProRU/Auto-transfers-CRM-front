import z from 'zod';

export const bidFormSchema = z.object({
  transit_method: z.string().nonempty('Метод транзита обязателен'),
  location: z.string().optional(),
  requested_title: z.boolean().optional(),
  notified_parking: z.boolean().optional(),
  notified_inspector: z.boolean().optional(),
});

export const rejectBidFormSchema = z.object({
  logistician_comment: z
    .string()
    .min(1, 'Необходимо заполнить причину отказа в заявке'),
});
