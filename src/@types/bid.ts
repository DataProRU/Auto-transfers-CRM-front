import type z from 'zod';
import type {
  bidFormSchema,
  OpeningManagerBidFormSchema,
  rejectBidFormSchema,
} from '../schemas/bid';

export type BidFormData = z.infer<typeof bidFormSchema>;

export type RejectBidFormData = z.infer<typeof rejectBidFormSchema>;

export type OpeningManagerBidFormData = z.infer<
  typeof OpeningManagerBidFormSchema
>;
