import axios from 'axios';
import { getToken } from '@homeberris/utils/auth';

const $host = axios.create({
  baseURL: 'http://192.168.27.15:6001'
});

const $authHost = axios.create({
  baseURL: 'http://192.168.27.15:6001'
});

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

export { $host, $authHost };
