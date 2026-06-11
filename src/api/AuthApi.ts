// =========================================================
// Llamadas al backend relacionadas con autenticación.
// Cada función mapea a un endpoint real de tu API.
// =========================================================
import api from './configs/axiosConfig';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from './types/Auth';

export const AuthApi = {
  // POST /auth/login
  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  // POST /auth/register
  register: (payload: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  // POST /auth/logout
  logout: () => api.post('/auth/logout').then((r) => r.data),
};
