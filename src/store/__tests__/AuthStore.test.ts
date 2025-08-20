// import { waitFor } from '@testing-library/react';
import { authStore } from '../AuthStore';
import AuthService from '../../services/AuthService';
import { decodeToken } from '../../utils/jwtDecode';
import * as apiErrorUtils from '../../utils/getAPIErrorMessage';

jest.mock('../../services/AuthService');
jest.mock('../../utils/jwtDecode');
jest.mock('../../setup/axios', () => ({
  APPROVED_ROLES: ['admin', 'user', 'manager'],
}));

// Мокаем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setIsAuth(false);
    authStore.setIsAuthChecking(false);
    authStore.setRole(null);
    authStore.setAuthError(null);
  });

  describe('Setters', () => {
    it('setIsAuth устанавливает состояние авторизации', () => {
      authStore.setIsAuth(true);
      expect(authStore.isAuth).toBe(true);

      authStore.setIsAuth(false);
      expect(authStore.isAuth).toBe(false);
    });

    it('setIsAuthChecking устанавливает состояние проверки авторизации', () => {
      authStore.setIsAuthChecking(true);
      expect(authStore.isAuthChecking).toBe(true);

      authStore.setIsAuthChecking(false);
      expect(authStore.isAuthChecking).toBe(false);
    });

    it('setRole устанавливает роль пользователя', () => {
      authStore.setRole('admin');
      expect(authStore.role).toBe('admin');

      authStore.setRole(null);
      expect(authStore.role).toBe(null);
    });

    it('setAuthError устанавливает ошибку авторизации', () => {
      authStore.setAuthError('Ошибка входа');
      expect(authStore.authError).toBe('Ошибка входа');

      authStore.setAuthError(null);
      expect(authStore.authError).toBe(null);
    });
  });

  describe('login', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockAccessToken = 'mock.access.token';
    const mockRefreshToken = 'mock.refresh.token';

    it('успешно авторизует пользователя с валидной ролью', async () => {
      authStore.setAuthError('Предыдущая ошибка');

      // Подготавливаем моки
      const mockResponse = {
        data: {
          access: mockAccessToken,
          refresh: mockRefreshToken,
        },
      };

      (AuthService.login as jest.Mock).mockResolvedValue(mockResponse);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'admin',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.login(mockEmail, mockPassword);

      expect(AuthService.login).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(decodeToken).toHaveBeenCalledWith(mockAccessToken);
      expect(authStore.isAuth).toBe(true);
      expect(authStore.role).toBe('admin');
      expect(authStore.authError).toBe(null);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crmAccess',
        mockAccessToken
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crmRefresh',
        mockRefreshToken
      );
      expect(result).toEqual(mockResponse);
    });

    it('отклоняет авторизацию пользователя с невалидной ролью', async () => {
      const mockResponse = {
        data: { access: mockAccessToken, refresh: mockRefreshToken },
      };

      (AuthService.login as jest.Mock).mockResolvedValue(mockResponse);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'invalid_role',
        exp: Date.now() + 3600000,
      });

      jest
        .spyOn(apiErrorUtils, 'getAPIErrorMessage')
        .mockReturnValue('Пользователь с данной ролью не может авторизоваться');

      await expect(authStore.login(mockEmail, mockPassword)).rejects.toThrow(
        'Пользователь с данной ролью не может авторизоваться'
      );

      expect(authStore.isAuth).toBe(false);
      expect(authStore.authError).toBe(
        'Пользователь с данной ролью не может авторизоваться'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmRefresh');

      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        'crmAccess',
        mockAccessToken
      );
      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        'crmRefresh',
        mockRefreshToken
      );
    });

    it('устанавливает токены если decodeToken возвращает null', async () => {
      const mockResponse = {
        data: {
          access: mockAccessToken,
          refresh: mockRefreshToken,
        },
      };

      (AuthService.login as jest.Mock).mockResolvedValue(mockResponse);
      (decodeToken as jest.Mock).mockReturnValue(null);

      const result = await authStore.login(mockEmail, mockPassword);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crmAccess',
        mockAccessToken
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crmRefresh',
        mockRefreshToken
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('очищает состояние авторизации и удаляет токены', () => {
      authStore.setIsAuth(true);
      authStore.setRole('admin');
      authStore.setAuthError('Some error');

      authStore.logout();

      expect(authStore.isAuth).toBe(false);
      expect(authStore.role).toBe(null);
      expect(authStore.authError).toBe(null);

      expect(localStorage.removeItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmRefresh');
    });
  });

  describe('verify', () => {
    const mockAccessToken = 'mock.access.token';

    it('успешно проверяет валидный токен с разрешенной ролью', async () => {
      (AuthService.verify as jest.Mock).mockResolvedValue(undefined);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'admin',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.verify(mockAccessToken);

      expect(AuthService.verify).toHaveBeenCalledWith(mockAccessToken);
      expect(decodeToken).toHaveBeenCalledWith(mockAccessToken);
      expect(authStore.isAuth).toBe(true);
      expect(authStore.role).toBe('admin');
      expect(authStore.authError).toBe(null);
      expect(authStore.isAuthChecking).toBe(false);
      expect(result).toBe(true);
    });

    it('отклоняет токен с неразрешенной ролью', async () => {
      (AuthService.verify as jest.Mock).mockResolvedValue(undefined);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'invalid_role',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.verify(mockAccessToken);

      expect(result).toBe(false);
      expect(authStore.isAuth).toBe(false);
      expect(authStore.authError).toBe(
        'Пользователь с данной ролью не может авторизоваться'
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmRefresh');
    });

    it('возвращает false при ошибке верификации', async () => {
      (AuthService.verify as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );

      const result = await authStore.verify(mockAccessToken);

      expect(result).toBe(false);
      expect(authStore.isAuth).toBe(false);
      expect(authStore.role).toBe(null);
      expect(authStore.isAuthChecking).toBe(false);
    });

    it('устанавливает isAuthChecking в true во время проверки', async () => {
      (AuthService.verify as jest.Mock).mockResolvedValue(undefined);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'user',
        exp: Date.now() + 3600000,
      });

      const verifyPromise = authStore.verify(mockAccessToken);
      expect(authStore.isAuthChecking).toBe(true);

      await verifyPromise;
      expect(authStore.isAuthChecking).toBe(false);
    });
  });

  describe('refresh', () => {
    const mockRefreshToken = 'mock.refresh.token';
    const mockNewAccessToken = 'mock.new.access.token';

    it('успешно обновляет токен с валидной ролью', async () => {
      const mockResponse = {
        data: {
          access: mockNewAccessToken,
        },
      };

      (AuthService.refresh as jest.Mock).mockResolvedValue(mockResponse);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'manager',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.refresh(mockRefreshToken);

      expect(AuthService.refresh).toHaveBeenCalledWith(mockRefreshToken);
      expect(decodeToken).toHaveBeenCalledWith(mockNewAccessToken);
      expect(authStore.isAuth).toBe(true);
      expect(authStore.role).toBe('manager');
      expect(authStore.authError).toBe(null);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'crmAccess',
        mockNewAccessToken
      );
      expect(authStore.isAuthChecking).toBe(false);
      expect(result).toBe(true);
    });

    it('отклоняет обновление токена с неразрешенной ролью', async () => {
      const mockNewAccessToken = 'mock.new.access.token';

      (AuthService.refresh as jest.Mock).mockResolvedValue({
        data: { access: mockNewAccessToken },
      });

      (decodeToken as jest.Mock).mockReturnValue({
        role: 'invalid_role',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.refresh('mock.refresh.token');

      expect(result).toBe(false);
      expect(authStore.isAuth).toBe(false);
      expect(authStore.authError).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmRefresh');
    });

    it('вызывает logout и возвращает false при ошибке обновления', async () => {
      (AuthService.refresh as jest.Mock).mockRejectedValue(
        new Error('Refresh failed')
      );

      const result = await authStore.refresh(mockRefreshToken);

      expect(result).toBe(false);
      expect(authStore.isAuth).toBe(false);
      expect(authStore.role).toBe(null);
      expect(authStore.authError).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.removeItem).toHaveBeenCalledWith('crmRefresh');
      expect(authStore.isAuthChecking).toBe(false);
    });

    it('устанавливает isAuthChecking в true во время обновления', async () => {
      const mockResponse = {
        data: {
          access: mockNewAccessToken,
        },
      };

      (AuthService.refresh as jest.Mock).mockResolvedValue(mockResponse);
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'user',
        exp: Date.now() + 3600000,
      });

      const refreshPromise = authStore.refresh(mockRefreshToken);
      expect(authStore.isAuthChecking).toBe(true);

      await refreshPromise;
      expect(authStore.isAuthChecking).toBe(false);
    });
  });

  describe('checkAuth', () => {
    const mockAccessToken = 'mock.access.token';
    const mockRefreshToken = 'mock.refresh.token';

    it('возвращает true если верификация токена успешна', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      (AuthService.verify as jest.Mock).mockResolvedValue(undefined);

      const result = await authStore.checkAuth();

      expect(localStorage.getItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.getItem).toHaveBeenCalledWith('crmRefresh');
      expect(result).toBe(true);
    });

    it('возвращает true если refresh токена успешен', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      (AuthService.verify as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );
      (AuthService.refresh as jest.Mock).mockResolvedValue({
        data: { access: 'new.access.token' },
      });
      (decodeToken as jest.Mock).mockReturnValue({
        role: 'user',
        exp: Date.now() + 3600000,
      });

      const result = await authStore.checkAuth();

      expect(result).toBe(true);
    });

    it('вызывает logout и возвращает false если нет токенов', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      const result = await authStore.checkAuth();

      expect(localStorage.getItem).toHaveBeenCalledWith('crmAccess');
      expect(localStorage.getItem).toHaveBeenCalledWith('crmRefresh');
      expect(result).toBe(false);
    });

    it('вызывает logout и возвращает false если нет refresh токена', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(null);

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
    });

    it('вызывает logout и возвращает false если нет access токена', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
    });

    it('возвращает false если и верификация и refresh неуспешны', async () => {
      localStorageMock.getItem
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      (AuthService.verify as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );
      (AuthService.refresh as jest.Mock).mockRejectedValue(
        new Error('Refresh failed')
      );

      const result = await authStore.checkAuth();

      expect(result).toBe(false);
    });
  });
});
