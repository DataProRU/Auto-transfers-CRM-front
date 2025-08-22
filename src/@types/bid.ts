import type z from 'zod';
import type {
  bidFormSchema,
  InspectorBidFormSchema,
  logistbidLoadingFormSchema,
  OpeningManagerBidFormSchema,
  ReExportBidFormSchema,
  rejectBidFormSchema,
  TitleBidFormSchema,
} from '../schemas/bid';

export type BidFormData = z.infer<typeof bidFormSchema>;

export type LogistBidLoadingFormData = z.infer<
  typeof logistbidLoadingFormSchema
>;

export type RejectBidFormData = z.infer<typeof rejectBidFormSchema>;

export type OpeningManagerBidFormData = z.infer<
  typeof OpeningManagerBidFormSchema
>;

export type TitleBidFormData = z.infer<typeof TitleBidFormSchema>;

export type InspectorBidFormData = z.infer<typeof InspectorBidFormSchema>;

export type ReExportBidFormData = z.infer<typeof ReExportBidFormSchema>;
