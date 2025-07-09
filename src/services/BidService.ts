import type { BidFormData, RejectBidFormData } from '../@types/bid';
import $api from '../setup/axios';

class BidService {
  static async getLogisticianBids() {
    return $api.get('/autotrips/bids/', {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async changeLogisticianBid(id: number, data: BidFormData) {
    return $api.put(`/autotrips/bids/${id}/`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async rejectLogisticianBid(id: number, data: RejectBidFormData) {
    return $api.put(`/autotrips/bids/${id}/reject/`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default BidService;
