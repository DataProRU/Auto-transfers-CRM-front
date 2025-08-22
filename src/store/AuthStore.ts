import { makeAutoObservable } from 'mobx';
import AuthService from '../services/AuthService';
import { decodeToken } from '../utils/jwtDecode';
import { APPROVED_ROLES } from '../setup/axios';
import { getAPIErrorMessage } from '../utils/getAPIErrorMessage';

class AuthStore {
  isAuth: boolean = false;
  isAuthChecking: boolean = false;
  role: string | null = null;
  authError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setIsAuth = (isAuth: boolean) => {
    this.isAuth = isAuth;
  };

  setIsAuthChecking = (isAuthChecking: boolean) => {
    this.isAuthChecking = isAuthChecking;
  };

  setRole = (role: string | null) => {
    this.role = role;
  };

  setAuthError = (authError: string | null) => {
    this.authError = authError;
  };

  login = async (email: string, password: string) => {
    try {
      this.setAuthError(null);

      const response = await AuthService.login(email, password);

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      const decoded = decodeToken(accessToken);

      if (decoded) {
        if (!APPROVED_ROLES.includes(decoded.role)) {
          this.setIsAuth(false);
          localStorage.removeItem('crmAccess');
          localStorage.removeItem('crmRefresh');

          const errorMessage =
            'Пользователь с данной ролью не может авторизоваться';
          this.setAuthError(errorMessage);
          throw new Error(errorMessage);
        }
        this.setIsAuth(true);
        this.setRole(decoded.role);
      }
      localStorage.setItem('crmAccess', accessToken);
      localStorage.setItem('crmRefresh', refreshToken);

      return response;
    } catch (e) {
      const message = getAPIErrorMessage(e);
      this.setAuthError(message);
      throw e;
    }
  };

  verify = async (accessToken: string) => {
    this.setIsAuthChecking(true);
    try {
      await AuthService.verify(accessToken);
      this.setIsAuth(true);

      const decoded = decodeToken(accessToken);
      if (decoded) {
        if (!APPROVED_ROLES.includes(decoded.role)) {
          this.setIsAuth(false);
          localStorage.removeItem('crmAccess');
          localStorage.removeItem('crmRefresh');

          const errorMessage =
            'Пользователь с данной ролью не может авторизоваться';
          this.setAuthError(errorMessage);
          throw new Error(errorMessage);
        }
        this.setRole(decoded.role);
      }

      this.setAuthError(null);

      return true;
    } catch {
      this.setIsAuth(false);
      this.setRole(null);

      return false;
    } finally {
      this.setIsAuthChecking(false);
    }
  };

  refresh = async (refreshToken: string) => {
    this.setIsAuthChecking(true);
    try {
      const response = await AuthService.refresh(refreshToken);
      const accessToken = response.data.access;
      localStorage.setItem('crmAccess', accessToken);

      this.setIsAuth(true);
      this.setAuthError(null);

      const decoded = decodeToken(accessToken);
      if (decoded) {
        if (!APPROVED_ROLES.includes(decoded.role)) {
          this.setIsAuth(false);
          localStorage.removeItem('crmAccess');
          localStorage.removeItem('crmRefresh');

          const errorMessage =
            'Пользователь с данной ролью не может авторизоваться';
          this.setAuthError(errorMessage);
          throw new Error(errorMessage);
        }
        this.setRole(decoded.role);
      }
      return true;
    } catch {
      this.logout();
      return false;
    } finally {
      this.setIsAuthChecking(false);
    }
  };

  logout = () => {
    this.setIsAuth(false);
    this.setAuthError(null);
    this.setRole(null);

    localStorage.removeItem('crmAccess');
    localStorage.removeItem('crmRefresh');
  };

  checkAuth = async () => {
    const accessToken = localStorage.getItem('crmAccess');
    const refreshToken = localStorage.getItem('crmRefresh');

    if (!accessToken || !refreshToken) {
      this.logout();
      return false;
    }

    const isVerified = await this.verify(accessToken);
    if (isVerified) return true;

    const isRefreshed = await this.refresh(refreshToken);
    return isRefreshed;
  };
}

/**
 *
 */
export const authStore = new AuthStore();
