import type { Client } from './UserResponse';

export interface BidData {
  untouched: Bid[];
  in_progress: Bid[];
}

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
}
