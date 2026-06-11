// Llamadas relacionadas al usuario logueado.
import api from './configs/axiosConfig';
import type { UserDetailResponse } from './types/User';

export const UserApi = {
  // GET /users/me -> datos completos del usuario actual (incluye score y empresa)
  me: () => api.get<UserDetailResponse>('/users/me').then((r) => r.data),
};
