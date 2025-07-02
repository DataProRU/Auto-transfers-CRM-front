import type { AuthResponse } from '../models/AuthResponse';
import $api from '../setup/axios';

class AuthService {
  static async login(login: string, password: string) {
    return $api.post<AuthResponse>(
      '/accounts/token/',
      { phone: login, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  static async refresh(refreshToken: string) {
    return $api.post('/accounts/token/refresh/', {
      refresh: refreshToken,
    });
  }

  static async verify(accessToken: string) {
    return $api.post('/accounts/token/verify/', {
      token: accessToken,
    });
  }
}

export default AuthService;
