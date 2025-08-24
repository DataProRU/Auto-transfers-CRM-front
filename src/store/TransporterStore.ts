import { action, makeAutoObservable } from 'mobx';
import type { Transporter } from '../models/TransporterResponse';
import TransporterService from '../services/TransporterService';
import { getAPIErrorMessage } from '../utils/getAPIErrorMessage';

class TransporterStore {
  transporters: Transporter[] | [] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTransporters = (transporters: Transporter[] | []) => {
    this.transporters = transporters;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setError = (error: string | null) => {
    this.error = error;
  };

  fetchTransporters = action(async () => {
    try {
      this.setIsLoading(true);
      const response = await TransporterService.getTransporters();

      this.setTransporters(response.data);
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setError(message);
      this.setTransporters([]);
    } finally {
      this.setIsLoading(false);
    }
  });
}

const transporterStore = new TransporterStore();

export default transporterStore;
