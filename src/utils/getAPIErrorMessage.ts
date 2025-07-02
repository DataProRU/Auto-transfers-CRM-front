import type { ApiError } from '../@types/api';

/**
 * Функция для проверки, является ли ошибка API
 * @param {unknown} e - ошибка
 * @returns {boolean} - результат проверки
 */
function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'response' in e;
}

/**
 * Получение сообщения об ошибке из API
 * @param {unknown} e - ошибка
 * @returns {string} - сообщение об ошибке
 */
export function getAPIErrorMessage(e: unknown) {
  const defaultMessage = 'Произошла неизвестная ошибка';

  if (isApiError(e)) {
    if (e.response?.data?.detail) {
      const message = e.response.data.detail;
      if (
        message.includes('No active account found with the given credentials')
      ) {
        return 'Неправильный логин или пароль';
      }
      return message;
    }

    if (e.response?.data) {
      for (const key in e.response.data) {
        if (Object.prototype.hasOwnProperty.call(e.response.data, key)) {
          const value = e.response.data[key];
          if (typeof value === 'string') {
            return value;
          }
          if (Array.isArray(value) && value.length > 0) {
            return value[0];
          }
        }
      }
    }
  } else if (e instanceof Error) {
    return e.message.includes('Network Error')
      ? 'Нет соединения c сервером'
      : e.message;
  }

  return defaultMessage;
}
