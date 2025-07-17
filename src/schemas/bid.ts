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

export const OpeningManagerBidFormSchema = z.object({
  openning_date: z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Дата должна быть в формате ДД.ММ.ГГГГ')
    .refine((str) => {
      const [day, month, year] = str.split('.');
      const date = new Date(`${year}-${month}-${day}`);
      return !isNaN(date.getTime());
    }, 'Некорректная дата'),
  opened: z.boolean().optional(),
  manager_comment: z.string().optional(),
});
