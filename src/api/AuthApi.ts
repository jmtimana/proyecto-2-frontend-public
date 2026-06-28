import api from './configs/axiosConfig';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from './types/Auth';

export const AuthApi = {

  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),
};
