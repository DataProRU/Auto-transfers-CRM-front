import { getAPIErrorMessage } from '../getAPIErrorMessage';
import type { ApiError } from '../../@types/api';

describe('getAPIErrorMessage', () => {
  describe('API Error handling', () => {
    it('should return custom message for invalid credentials', () => {
      const apiError: ApiError = {
        response: {
          data: {
            detail: 'No active account found with the given credentials',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe(
        'Неправильный логин или пароль'
      );
    });

    it('should return custom message for title without logistician notification', () => {
      const apiError: ApiError = {
        response: {
          data: {
            detail: 'Cannot take title without logistician notification.',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe(
        'Нельзя забрать тайтл без уведомления логиста'
      );
    });

    it('should return detail message for other API errors', () => {
      const apiError: ApiError = {
        response: {
          data: {
            detail: 'Some other API error message',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Some other API error message');
    });

    it('should return first string value from response data when no detail', () => {
      const apiError: ApiError = {
        response: {
          data: {
            error: 'First error message',
            message: 'Second error message',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('First error message');
    });

    it('should return first array element when response data contains arrays', () => {
      const apiError: ApiError = {
        response: {
          data: {
            errors: ['First array error', 'Second array error'],
            message: 'String message',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('First array error');
    });

    it('should return first array element when no string values found', () => {
      const apiError: ApiError = {
        response: {
          data: {
            errors: ['Array error message'],
            code: 400,
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Array error message');
    });
  });

  describe('Network Error handling', () => {
    it('should return custom message for Network Error', () => {
      const networkError = new Error('Network Error');

      expect(getAPIErrorMessage(networkError)).toBe(
        'Нет соединения c сервером'
      );
    });

    it('should return original message for other Error instances', () => {
      const regularError = new Error('Some regular error message');

      expect(getAPIErrorMessage(regularError)).toBe(
        'Some regular error message'
      );
    });
  });

  describe('Edge cases', () => {
    it('should return default message for null', () => {
      expect(getAPIErrorMessage(null)).toBe('Произошла неизвестная ошибка');
    });

    it('should return default message for undefined', () => {
      expect(getAPIErrorMessage(undefined)).toBe(
        'Произошла неизвестная ошибка'
      );
    });

    it('should return default message for string', () => {
      expect(getAPIErrorMessage('some string')).toBe(
        'Произошла неизвестная ошибка'
      );
    });

    it('should return default message for number', () => {
      expect(getAPIErrorMessage(123)).toBe('Произошла неизвестная ошибка');
    });

    it('should return default message for API error without response', () => {
      const apiError: ApiError = {};

      expect(getAPIErrorMessage(apiError)).toBe('Произошла неизвестная ошибка');
    });

    it('should return default message for API error with empty response data', () => {
      const apiError: ApiError = {
        response: {
          data: {},
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Произошла неизвестная ошибка');
    });

    it('should return default message for API error with non-string/non-array data', () => {
      const apiError: ApiError = {
        response: {
          data: {
            code: 400,
            status: 'error',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('error');
    });

    it('should return default message for API error with empty arrays', () => {
      const apiError: ApiError = {
        response: {
          data: {
            errors: [],
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Произошла неизвестная ошибка');
    });
  });
});
