import z from 'zod';

export const authSchema = z.object({
  login: z.string().min(1, 'Логин обязателен для заполнения'),
  password: z.string().min(6, 'Пароль должен состоянить минимум из 8 символов'),
});
