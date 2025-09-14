import { getAPIErrorMessage } from '../getAPIErrorMessage';
import type { ApiError } from '../../@types/api';

describe('getAPIErrorMessage', () => {
  describe('API Error handling', () => {
    it('Возврат сообщения - Неправильный логин или пароль', () => {
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

    it('Возврат сообщения - Нельзя забрать тайтл без уведомления логиста', () => {
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

    it('Возврат сообщения ошибки API', () => {
      const apiError: ApiError = {
        response: {
          data: {
            detail: 'Some other API error message',
          },
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Some other API error message');
    });

    it('Возвращает первую строку из response data еогда нету detail', () => {
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

    it('возвращает первый элемент массива если response data содержит массив', () => {
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
  });

  describe('Network Error', () => {
    it('возвращает дефолтное сообщение при Network Error', () => {
      const networkError = new Error('Network Error');

      expect(getAPIErrorMessage(networkError)).toBe(
        'Нет соединения c сервером'
      );
    });

    it('возарвщает сообщение API ошибки', () => {
      const regularError = new Error('Some regular error message');

      expect(getAPIErrorMessage(regularError)).toBe(
        'Some regular error message'
      );
    });
  });

  describe('Краевые случаи', () => {
    it('возвращает дефолтное сообщение при null', () => {
      expect(getAPIErrorMessage(null)).toBe('Произошла неизвестная ошибка');
    });

    it('возвращает дефолтное сообщение при undefined', () => {
      expect(getAPIErrorMessage(undefined)).toBe(
        'Произошла неизвестная ошибка'
      );
    });

    it('возвращает дефолтное сообщение для строки', () => {
      expect(getAPIErrorMessage('some string')).toBe(
        'Произошла неизвестная ошибка'
      );
    });

    it('возвращает дефолтное сообщение для числа', () => {
      expect(getAPIErrorMessage(123)).toBe('Произошла неизвестная ошибка');
    });

    it('возвращает дефолтное сообщение при  API ошибке без response', () => {
      const apiError: ApiError = {};

      expect(getAPIErrorMessage(apiError)).toBe('Произошла неизвестная ошибка');
    });

    it('возвращает дефолтное сообщение при пустом ответе API', () => {
      const apiError: ApiError = {
        response: {
          data: {},
        },
      };

      expect(getAPIErrorMessage(apiError)).toBe('Произошла неизвестная ошибка');
    });

    it('возвращает дефолтное сообщение при пустом массиве API', () => {
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
