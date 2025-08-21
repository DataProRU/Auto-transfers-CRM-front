import { action, makeAutoObservable } from 'mobx';
import type { Tranporter } from '../models/TranporterResponse';
import TranporterService from '../services/TransporterService';
import { getAPIErrorMessage } from '../utils/getAPIErrorMessage';

class TransporterStore {
  tranporters: Tranporter[] | [] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTranporters = (transporters: Tranporter[] | []) => {
    this.tranporters = transporters;
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
      const response = await TranporterService.getTranporters();

      this.setTranporters(response.data);
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setError(message);
      this.setTranporters([]);
    } finally {
      this.setIsLoading(false);
    }
  });
}

const transporterStore = new TransporterStore();

export default transporterStore;
