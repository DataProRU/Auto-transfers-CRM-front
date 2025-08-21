import $api from '../setup/axios';

class TranporterService {
  static async getTranporters() {
    return $api.get('/autotrips/transporters/', {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default TranporterService;
