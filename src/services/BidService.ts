import type {
  BidFormData,
  InspectorBidFormData,
  LogistBidLoadingFormData,
  OpeningManagerBidFormData,
  ReExportBidFormData,
  RejectBidFormData,
  TitleBidFormData,
} from '../@types/bid';
import $api from '../setup/axios';

class BidService {
  static async getBids(status: string | null = null) {
    return $api.get(
      !status ? '/autotrips/bids/' : `/autotrips/bids/?status=${status}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  static async changeBid(
    id: number,
    data:
      | BidFormData
      | OpeningManagerBidFormData
      | TitleBidFormData
      | InspectorBidFormData
      | ReExportBidFormData
      | LogistBidLoadingFormData,
    status: string | null = null
  ) {
    return $api.put(`/autotrips/bids/${id}/`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Vehicle-Status': status || 'initial',
      },
    });
  }

  static async rejectBid(id: number, data: RejectBidFormData) {
    return $api.put(`/autotrips/bids/${id}/reject/`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default BidService;
