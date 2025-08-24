import z from 'zod';

export const bidFormSchema = z.object({
  transit_method: z.string().nonempty('Метод транзита обязателен'),
  location: z.string().optional(),
  requested_title: z.boolean().optional(),
  notified_parking: z.boolean().optional(),
  notified_inspector: z.boolean().optional(),
});

export const logistbidLoadingFormSchema = z.object({
  vehicle_transporter: z.number({
    required_error: 'Автовоз не может быть пустым',
    invalid_type_error: 'Автовоз не может быть пустым',
  }),
  logistician_keys_number: z
    .number()
    .min(1, 'Количество ключей должно быть не менее 1'),
});

export const rejectBidFormSchema = z.object({
  logistician_comment: z
    .string()
    .min(1, 'Необходимо заполнить причину отказа в заявке'),
});

export const OpeningManagerBidFormSchema = z.object({
  openning_date: z
    .union([z.string(), z.null()])
    .optional()
    .superRefine((val, ctx) => {
      if (val === null || val === undefined || val === '') return true;

      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Дата должна быть в формате ДД.ММ.ГГГГ',
        });
        return false;
      }

      const [day, month, year] = val.split('.');
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Некорректная дата',
        });
        return false;
      }

      return true;
    })
    .transform((val) => (val === '' ? null : val)),
  opened: z.boolean().optional(),
  manager_comment: z.string().optional(),
});

export const TitleBidFormSchema = z.object({
  pickup_address: z.string().optional(),
  took_title: z.string(),
  notified_logistician_by_title: z.boolean().optional(),
});

export const InspectorBidFormSchema = z.object({
  transit_number: z.string().optional(),
  inspection_done: z.string(),
  notified_logistician_by_inspector: z.boolean().optional(),
  number_sent: z.boolean().optional(),
  inspection_paid: z.boolean().optional(),
  inspector_comment: z.string().optional(),
});

export const ReExportBidFormSchema = z.object({
  export: z.boolean().optional(),
  prepared_documents: z.boolean().optional(),
});

export const RecieverBidFormSchema = z.object({
  vehicle_arrival_date: z
    .union([z.string(), z.null()])
    .optional()
    .superRefine((val, ctx) => {
      if (val === null || val === undefined || val === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Примерная дата прибытия не может быть пустой',
        });
        return false;
      }

      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Дата должна быть в формате ДД.ММ.ГГГГ',
        });
        return false;
      }

      const [day, month, year] = val.split('.');
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Некорректная дата',
        });
        return false;
      }

      return true;
    })
    .transform((val) => (val === '' ? null : val)),
  receive_vehicle: z.boolean().optional(),
  receive_documents: z.boolean().optional(),
  full_acceptance: z.boolean().optional(),
  receiver_keys_number: z.number().optional(),
});
