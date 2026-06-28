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

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && tokenStorage.getRefresh()) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {

          const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
            refreshToken: tokenStorage.getRefresh(),
          });
          tokenStorage.save(data.accessToken, data.refreshToken);
          isRefreshing = false;

          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (refreshError) {

          isRefreshing = false;
          tokenStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
