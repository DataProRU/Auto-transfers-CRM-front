import { action, type Ctx } from '@reatom/core';
import AuthService from '../../services/AuthService';
import {
  accessTokenAtom,
  authErrorAtom,
  authRoleAtom,
  isAuthAtom,
  isAuthCheckingAtom,
  refreshTokenAtom,
} from './atoms';
import { isApiError } from '../../utils/isAPIError';
import { decodeToken } from '../../utils/jwtDecode';
import { APPROVED_ROLES } from '../../setup/axios';

export const login = action(
  async (ctx: Ctx, login: string, password: string) => {
    try {
      const response = await AuthService.login(login, password);

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      accessTokenAtom(ctx, accessToken);
      refreshTokenAtom(ctx, refreshToken);
      isAuthAtom(ctx, true);
      authErrorAtom(ctx, null);

      localStorage.setItem('crmAccess', accessToken);
      localStorage.setItem('crmRefresh', refreshToken);

      const decoded = decodeToken(accessToken);

      if (decoded) {
        if (!APPROVED_ROLES.includes(decoded.role)) {
          isAuthAtom(ctx, false);
          accessTokenAtom(ctx, null);
          refreshTokenAtom(ctx, null);
          localStorage.removeItem('crmAccess');
          localStorage.removeItem('crmRefresh');

          const errorMessage =
            'Пользователь с данной ролью не может авторизоваться';
          authErrorAtom(ctx, errorMessage);
          throw new Error(errorMessage);
        }
        authRoleAtom(ctx, decoded.role);
      }

      return response;
    } catch (e) {
      const defaultMessage = 'Произошла неизвестная ошибка';
      let message = defaultMessage;

      if (isApiError(e)) {
        message = e.response?.data?.detail || defaultMessage;
        if (
          message.includes('No active account found with the given credentials')
        ) {
          message = 'Неправильный логин или пароль';
        }
      } else if (e instanceof Error) {
        message = e.message.includes('Network Error')
          ? 'Нет соединения c сервером'
          : e.message;
      }

      authErrorAtom(ctx, message);
      throw e;
    }
  },
  'login'
);

export const verify = action(async (ctx: Ctx, accessToken: string) => {
  isAuthCheckingAtom(ctx, true);
  try {
    await AuthService.verify(accessToken);
    isAuthAtom(ctx, true);
    authErrorAtom(ctx, null);

    const decoded = decodeToken(accessToken);

    if (decoded) {
      if (!APPROVED_ROLES.includes(decoded.role)) {
        isAuthAtom(ctx, false);
        accessTokenAtom(ctx, null);
        refreshTokenAtom(ctx, null);
        localStorage.removeItem('crmAccess');
        localStorage.removeItem('crmRefresh');

        const errorMessage =
          'Пользователь с данной ролью не может авторизоваться';
        authErrorAtom(ctx, errorMessage);
        throw new Error(errorMessage);
      }
      authRoleAtom(ctx, decoded.role);
    }

    return true;
  } catch {
    isAuthAtom(ctx, false);
    accessTokenAtom(ctx, null);
    return false;
  } finally {
    isAuthCheckingAtom(ctx, false);
  }
}, 'verify');

export const refresh = action(async (ctx: Ctx, refreshToken: string) => {
  isAuthCheckingAtom(ctx, true);
  try {
    const response = await AuthService.refresh(refreshToken);
    const accessToken = response.data.access;
    console.log(accessToken);

    accessTokenAtom(ctx, accessToken);
    localStorage.setItem('crmAccess', accessToken);

    isAuthAtom(ctx, true);
    authErrorAtom(ctx, null);

    const decoded = decodeToken(accessToken);

    if (decoded) {
      if (!APPROVED_ROLES.includes(decoded.role)) {
        isAuthAtom(ctx, false);
        accessTokenAtom(ctx, null);
        refreshTokenAtom(ctx, null);
        localStorage.removeItem('crmAccess');
        localStorage.removeItem('crmRefresh');

        const errorMessage =
          'Пользователь с данной ролью не может авторизоваться';
        authErrorAtom(ctx, errorMessage);
        throw new Error(errorMessage);
      }
      authRoleAtom(ctx, decoded.role);
    }

    return true;
  } catch {
    isAuthAtom(ctx, false);
    logout(ctx);
    return false;
  } finally {
    isAuthCheckingAtom(ctx, false);
  }
}, 'refresh');

export const logout = action((ctx) => {
  accessTokenAtom(ctx, null);
  refreshTokenAtom(ctx, null);
  isAuthAtom(ctx, false);
  authErrorAtom(ctx, null);
  authRoleAtom(ctx, null);

  localStorage.removeItem('crmAccess');
  localStorage.removeItem('crmRefresh');
}, 'logout');

export const checkAuth = action(async (ctx: Ctx) => {
  const accessToken = localStorage.getItem('crmAccess');
  const refreshToken = localStorage.getItem('crmRefresh');

  if (!accessToken || !refreshToken) {
    logout(ctx);
    return false;
  }

  const isVerified = await verify(ctx, accessToken);
  if (isVerified) return true;

  const isRefreshed = await refresh(ctx, refreshToken);
  return isRefreshed;
}, 'checkAuth');
