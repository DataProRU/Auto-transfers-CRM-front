import type z from 'zod';
import type { authSchema } from '../schemas/auth';

export type AuthFormData = z.infer<typeof authSchema>;
