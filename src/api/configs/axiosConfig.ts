// =========================================================
// Configuración central de Axios (la librería para llamar al backend).
//
// Hace 2 cosas automáticamente, así no las repetimos en cada llamada:
//   1. Le pega la URL base de tu backend (desde .env).
//   2. Mete el token JWT en el header "Authorization" de cada request.
//      Y si el token expiró (error 401), intenta renovarlo UNA vez
//      con el refresh token, y reintenta la llamada.
// =========================================================
import axios from 'axios';
import { tokenStorage } from '../../utils/tokenStorage';
import type { AuthResponse } from '../types/Auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({ baseURL });

// --- Interceptor de SALIDA: antes de cada request, mete el token ---
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Interceptor de ENTRADA: si la respuesta es 401, intenta refrescar ---
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Si fue 401, aún no reintentamos esta llamada, y tenemos refresh token:
    if (status === 401 && !original._retry && tokenStorage.getRefresh()) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Pedimos un token nuevo. Usamos axios "pelado" para no entrar en bucle.
          const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, {
            refreshToken: tokenStorage.getRefresh(),
          });
          tokenStorage.save(data.accessToken, data.refreshToken);
          isRefreshing = false;
          // Reintentamos la llamada original con el token nuevo.
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch (refreshError) {
          // El refresh falló: la sesión expiró de verdad. Limpiamos y vamos a login.
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
