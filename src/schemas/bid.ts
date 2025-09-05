import z from 'zod';

export const bidFormSchema = z
  .object({
    transit_method: z.string().nonempty('Метод транзита обязателен'),
    acceptance_type: z.string().optional(),
    location: z.string().optional(),
    requested_title: z.boolean().optional(),
    notified_parking: z.boolean().optional(),
    notified_inspector: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.transit_method === 'without_openning') {
        return data.acceptance_type && data.acceptance_type.trim() !== '';
      }
      return true;
    },
    {
      message: 'Тип принятия обязателен при выборе "Без открытия"',
      path: ['acceptance_type'],
    }
  )
  .refine(
    (data) => {
      if (
        data.transit_method === 'without_openning' &&
        data.acceptance_type === 'with_re_export'
      ) {
        return data.requested_title === true;
      }
      return true;
    },
    {
      message: 'Запрос тайтла обязателен при выборе "Без реэкспорта"',
      path: ['requested_title'],
    }
  );

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

export const OpeningManagerBidFormSchema = z
  .object({
    openning_date: z
      .string()
      .nonempty('Дата открытия обязательна для заполнения')
      .superRefine((val, ctx) => {
        if (val) {
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
        }

        return true;
      }),
    opened: z.boolean(),
    manager_comment: z.string().optional(),
  })
  .refine((data) => data.opened == true, {
    message: 'Необходимо подтвердить открытие',
    path: ['opened'],
  });

export const TitleBidFormSchema = z.object({
  pickup_address: z.string().optional(),
  took_title: z.string(),
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
