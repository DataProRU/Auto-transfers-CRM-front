import type {
  BidFormData,
  OpeningManagerBidFormData,
  RejectBidFormData,
} from '../@types/bid';
import $api from '../setup/axios';

class BidService {
  static async getBids() {
    return $api.get('/autotrips/bids/', {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async changeBid(
    id: number,
    data: BidFormData | OpeningManagerBidFormData
  ) {
    return $api.put(`/autotrips/bids/${id}/`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async rejectBid(id: number, data: RejectBidFormData) {
    return $api.put(`/autotrips/bids/${id}/reject/`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default BidService;
