import type { Client } from './UserResponse';

export interface Bid {
  id: number;
  client: Client;
  brand: string;
  model: string;
  vin: string;
  container_number: string;
  arrival_date: string;
  transporter: string;
  recipient: string;
  transit_method: string | null;
  location: string | null;
  requested_title: boolean;
  notified_parking: boolean;
  notified_inspector: boolean;
  openning_date: string | null;
  approved_by_inspector: boolean;
  approved_by_title: boolean;
  approved_by_re_export: boolean;
  opened: boolean;
  manager_comment: string | null;
  pickup_address: string | null;
  title_collection_date: string | null;
  took_title: string | null;
  notified_logistician_by_title: boolean;
  notified_logistician_by_inspector: boolean;
  acceptance_date: string | null;
  transit_number: string | null;
  inspection_done: string | null;
  inspection_date: string | null;
  number_sent: boolean;
  number_sent_date: string | null;
  inspection_paid: boolean;
  inspector_comment: string | null;
}
