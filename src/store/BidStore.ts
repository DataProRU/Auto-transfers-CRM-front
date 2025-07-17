import { makeAutoObservable } from 'mobx';
import { getAPIErrorMessage } from '../utils/getAPIErrorMessage';
import BidService from '../services/BidService';
import type {
  BidFormData,
  OpeningManagerBidFormData,
  RejectBidFormData,
} from '../@types/bid';
import type { Bid } from '../models/BidResponse';

class BidStore {
  bid: Bid | null = null;
  isBidLoading: boolean = false;
  bidError: string | null = null;
  untouchedBids: Bid[] | [] = [];
  inProgressBids: Bid[] | [] = [];

  setBid(bid: Bid | null) {
    this.bid = bid;
  }

  setIsBidLoaging(isBidLoading: boolean) {
    this.isBidLoading = isBidLoading;
  }

  setBidError(bidError: string | null) {
    this.bidError = bidError;
  }

  setuntouchedBids(untouchedBids: Bid[] | []) {
    this.untouchedBids = untouchedBids;
  }

  setInProgressBids(inProgressBids: Bid[] | []) {
    this.inProgressBids = inProgressBids;
  }

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  fetchBids = async () => {
    try {
      this.setIsBidLoaging(true);
      const response = await BidService.getBids();

      const unTouched = response.data.untouched;
      this.setuntouchedBids(unTouched);

      const inProgress = response.data.in_progress;
      this.setInProgressBids(inProgress);
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setBidError(message);
      this.setInProgressBids([]);
    } finally {
      this.setIsBidLoaging(false);
    }
  };

  updateBid = async (id: number, data: BidFormData) => {
    try {
      this.setIsBidLoaging(true);
      this.setBidError(null);
      await BidService.changeBid(id, data);

      if (data.transit_method !== null) {
        const movedBid = this.untouchedBids.find((bid) => bid.id === id);
        if (movedBid) {
          const updatedUntouched = this.untouchedBids.filter(
            (bid) => bid.id !== id
          );
          this.setuntouchedBids(updatedUntouched);

          this.setInProgressBids([
            ...this.inProgressBids,
            { ...movedBid, ...data },
          ]);
        } else {
          const updatedInProgress = this.inProgressBids.map((bid) =>
            bid.id === id ? { ...bid, ...data } : bid
          );
          this.setInProgressBids(updatedInProgress);
        }
      } else {
        const movedBid = this.inProgressBids.find((bid) => bid.id === id);
        if (movedBid) {
          const updatedInProgress = this.inProgressBids.filter(
            (bid) => bid.id !== id
          );
          this.setInProgressBids(updatedInProgress);

          this.setuntouchedBids([
            ...this.untouchedBids,
            { ...movedBid, ...data },
          ]);
        }
      }
      return true;
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setBidError(message);
      return false;
    } finally {
      this.setIsBidLoaging(false);
    }
  };

  openningManagerUpdateBid = async (
    id: number,
    data: OpeningManagerBidFormData
  ) => {
    try {
      this.setIsBidLoaging(true);
      this.setBidError(null);
      await BidService.changeBid(id, data);
      if (data.openning_date !== null) {
        const movedBid = this.untouchedBids.find((bid) => bid.id === id);
        if (movedBid) {
          const updatedUntouched = this.untouchedBids.filter(
            (bid) => bid.id !== id
          );
          this.setuntouchedBids(updatedUntouched);

          this.setInProgressBids([
            ...this.inProgressBids,
            { ...movedBid, ...data },
          ]);
        } else {
          const updatedInProgress = this.inProgressBids.map((bid) =>
            bid.id === id ? { ...bid, ...data } : bid
          );
          this.setInProgressBids(updatedInProgress);
        }
      } else {
        const movedBid = this.inProgressBids.find((bid) => bid.id === id);
        if (movedBid) {
          const updatedInProgress = this.inProgressBids.filter(
            (bid) => bid.id !== id
          );
          this.setInProgressBids(updatedInProgress);

          this.setuntouchedBids([
            ...this.untouchedBids,
            { ...movedBid, ...data },
          ]);
        }
      }

      return true;
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setBidError(message);
      return false;
    } finally {
      this.setIsBidLoaging(false);
    }
  };

  rejectBid = async (id: number, data: RejectBidFormData) => {
    try {
      this.setIsBidLoaging(true);
      this.setBidError(null);

      const response = await BidService.rejectBid(id, data);
      if (response.data.transit_method !== null) {
        const updatedInProgress = this.inProgressBids.filter(
          (bid) => bid.id !== id
        );
        this.setInProgressBids(updatedInProgress);
      } else {
        const updatedUntouched = this.untouchedBids.filter(
          (bid) => bid.id !== id
        );
        this.setuntouchedBids(updatedUntouched);
      }

      return true;
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setBidError(message);
      return false;
    } finally {
      this.setIsBidLoaging(false);
    }
  };
}

const bidStore = new BidStore();

export default bidStore;
