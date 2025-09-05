import { action, makeAutoObservable } from 'mobx';
import { getAPIErrorMessage } from '../utils/getAPIErrorMessage';
import BidService from '../services/BidService';
import type {
  BidFormData,
  InspectorBidFormData,
  LogistBidLoadingFormData,
  OpeningManagerBidFormData,
  RecieverBidFormData,
  ReExportBidFormData,
  RejectBidFormData,
  TitleBidFormData,
} from '../@types/bid';
import type { Bid } from '../models/BidResponse';

class BidStore {
  bid: Bid | null = null;
  isBidLoading: boolean = false;
  bidError: string | null = null;
  untouchedBids: Bid[] | [] = [];
  inProgressBids: Bid[] | [] = [];
  сompletedBids: Bid[] | [] = [];
  isBidFromLoading: boolean = false;

  setBid = (bid: Bid | null) => {
    this.bid = bid;
  };

  setIsBidLoaging = (isBidLoading: boolean) => {
    this.isBidLoading = isBidLoading;
  };

  setBidError = (bidError: string | null) => {
    this.bidError = bidError;
  };

  setuntouchedBids = (untouchedBids: Bid[] | []) => {
    this.untouchedBids = untouchedBids;
  };

  setInProgressBids = (inProgressBids: Bid[] | []) => {
    this.inProgressBids = inProgressBids;
  };

  setCompletedBids = (completedBids: Bid[] | []) => {
    this.сompletedBids = completedBids;
  };

  setBidFromLoading = (isBidFromLOading: boolean) => {
    this.isBidFromLoading = isBidFromLOading;
  };

  constructor() {
    makeAutoObservable(this);
  }

  fetchBids = async (status: string | null = null) => {
    try {
      this.setIsBidLoaging(true);
      this.setBidFromLoading(false);
      const response = await BidService.getBids(status);

      const unTouched = response.data.untouched;
      this.setuntouchedBids(unTouched);

      const inProgress = response.data.in_progress;
      this.setInProgressBids(inProgress);

      if (response.data.completed) {
        this.setCompletedBids(response.data.completed);
      }
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setBidError(message);
      this.setInProgressBids([]);
    } finally {
      if (status) this.setBidFromLoading(true);
      this.setIsBidLoaging(false);
    }
  };

  updateBid = async (
    id: number,
    data:
      | BidFormData
      | OpeningManagerBidFormData
      | TitleBidFormData
      | InspectorBidFormData
      | LogistBidLoadingFormData,
    inProgressCondition: boolean,
    status: string | null = null
  ) => {
    try {
      this.setBidError(null);
      const response = await BidService.changeBid(id, data, status);
      const updatedData = response.data;

      if (inProgressCondition) {
        const movedBid = this.untouchedBids.find((bid) => bid.id === id);
        if (movedBid) {
          const updatedUntouched = this.untouchedBids.filter(
            (bid) => bid.id !== id
          );
          this.setuntouchedBids(updatedUntouched);

          this.setInProgressBids([
            ...this.inProgressBids,
            {
              ...movedBid,
              ...data,
              vehicle_transporter: updatedData.vehicle_transporter || undefined,
            },
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
    }
  };

  updateExpandedBid = action(
    async (
      id: number,
      data: ReExportBidFormData | RecieverBidFormData,
      inProgressCondition: boolean,
      completedCondition: boolean,
      status: string | null = null
    ) => {
      try {
        this.setBidError(null);
        await BidService.changeBid(id, data, status);

        if (inProgressCondition) {
          if (completedCondition) {
            const movedBid =
              this.untouchedBids.find((bid) => bid.id === id) ||
              this.inProgressBids.find((bid) => bid.id === id);

            if (movedBid) {
              const updatedUntouched = this.untouchedBids.filter(
                (bid) => bid.id !== id
              );
              this.setuntouchedBids(updatedUntouched);

              const updatedInProgress = this.inProgressBids.filter(
                (bid) => bid.id !== id
              );
              this.setInProgressBids(updatedInProgress);

              this.setCompletedBids([
                ...this.сompletedBids,
                { ...movedBid, ...data },
              ]);
            } else {
              const updatedCompleted = this.сompletedBids.map((bid) =>
                bid.id === id ? { ...bid, ...data } : bid
              );
              this.setCompletedBids(updatedCompleted);
            }
          } else {
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
      }
    }
  );

  rejectBid = async (id: number, data: RejectBidFormData) => {
    try {
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
    }
  };
}

const bidStore = new BidStore();

export default bidStore;
