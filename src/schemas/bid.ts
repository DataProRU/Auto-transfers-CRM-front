import z from 'zod';

export const bidFormSchema = z.object({
  transit_method: z.string().nonempty('Метод транзита обязателен'),
  location: z.string().nonempty('Местоположение обязателено'),
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

export const TitleBidFormSchema = z.object({
  pickup_address: z.string().nonempty('Не указан адрес забора'),
  took_title: z.string(),
  notified_logistician_by_title: z.boolean().optional(),
});

export const InspectorBidFormSchema = z.object({
  transit_number: z.string().nonempty('Транзитный номер обязательный'),
  inspection_done: z.string(),
  notified_logistician_by_inspector: z.boolean().optional(),
  number_sent: z.boolean().optional(),
  inspection_paid: z.boolean().optional(),
  inspector_comment: z.string().optional(),
});
