import axios from 'axios';
import { tokenStorage } from '../../utils/tokenStorage';
import type { AuthResponse } from '../types/Auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (!error.response) {
      original._retryCount = (original._retryCount || 0) + 1;
      if (original._retryCount < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, BASE_DELAY * Math.pow(2, original._retryCount - 1)));
        return api(original);
      }
      return Promise.reject(error);
    }

    const isRecoverable = status === 429 || (status! >= 500 && status! <= 599);

    if (isRecoverable) {
      const retryCount = original._retryCount || 0;
      if (retryCount < MAX_RETRIES) {
        original._retryCount = retryCount + 1;
        await new Promise((r) => setTimeout(r, BASE_DELAY * Math.pow(2, retryCount)));
        return api(original);
      }
    }

    if (status === 401 && !original._retry && tokenStorage.getRefresh()) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {

          const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
            refreshToken: tokenStorage.getRefresh(),
          });
          tokenStorage.save(data.accessToken, data.refreshToken);
          processQueue(null, data.accessToken);

          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (refreshError) {

          processQueue(refreshError, null);
          tokenStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    return Promise.reject(error);
  }
);

export default api;
