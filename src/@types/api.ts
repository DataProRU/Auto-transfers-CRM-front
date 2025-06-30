/**
 * Тип для обработки ошибок API
 */
export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
  };
}

/**
 * Тип для обработки ошибок API
 */
export interface ApiErrorResponse {
  detail?: string;
  [key: string]: unknown;
}
