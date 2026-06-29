import axios from 'axios';
import { getToken, removeToken } from '@homeberris/utils/auth';

const $host = axios.create({
  // baseURL: 'http://192.168.27.15:6001'
  baseURL: 'http://localhost:6001'

});

const $authHost = axios.create({
  // baseURL: 'http://192.168.27.15:6001'
  baseURL: 'http://localhost:6001'

});

const onResponseError = (error: any) => {
  const status = error?.response?.data?.statusCode || error?.response?.status;
  const message = error?.response?.data?.message;
  if ((status === 400 || status === 401) && typeof message === 'string' && message.startsWith('jwt')) {
    removeToken();
  }
  if (status === 403) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/security/login';
      return new Promise(() => {});
    }
  }
  return Promise.reject(error);
};

// Добавляем токен из cookies для всех запросов, которые используют $authHost
$authHost.interceptors.request.use(
  config => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

$authHost.interceptors.response.use(response => response, onResponseError);
$host.interceptors.response.use(response => response, onResponseError);

export { $host, $authHost };
