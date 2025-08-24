import $api from '../setup/axios';

class TransporterService {
  static async getTransporters() {
    return $api.get('/autotrips/transporters/', {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default TransporterService;
