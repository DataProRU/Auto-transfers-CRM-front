import axios from 'axios';

export const API_URL = import.meta.env.VITE_BACKEND_URL;

export const APPROVED_ROLES = [
  'logistician',
  'opening_manager',
  'title',
  'inspector',
  're_export',
  'reciever',
  'user',
];

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

/**
 * Интерцептор запросов
 * @param {AxiosRequestConfig} config Конфигурация запроса
 * @returns {AxiosRequestConfig} Конфигурация запроса
 */
$api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crmAccess');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Интерцептор ответов
 * @param {AxiosResponse} config Конфигурация ответа
 * @returns {AxiosResponse} Конфигурация ответа
 */
$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    const isExcludedUrl =
      originalRequest.url.includes('/verify') ||
      originalRequest.url.includes('/refresh') ||
      originalRequest.url.includes('/token');
    if (
      statusCode == 401 &&
      error.config &&
      !error.config._isRetry == true &&
      !isExcludedUrl
    ) {
      originalRequest._isRetry = true;
      try {
        const refreshToken = localStorage.getItem('crmRefresh');
        const responce = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('crmAccess', responce.data.access);
        return $api.request(originalRequest);
      } catch {
        window.location.href = '/auth';
      }
    }
    throw error;
  }
);

export default $api;
