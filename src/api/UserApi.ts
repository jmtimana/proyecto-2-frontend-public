// Llamadas relacionadas al usuario logueado.
import api from './configs/axiosConfig';
import type {
  UserDetailResponse,
  UserUpdateRequest,
  EmpresaUpdateRequest,
} from './types/User';

export const UserApi = {
  // GET /users/me -> datos completos del usuario actual (incluye score y empresa)
  me: () => api.get<UserDetailResponse>('/users/me').then((r) => r.data),

  // PUT /users/me -> actualiza nombre / apellido / githubUsername
  update: (payload: UserUpdateRequest) =>
    api.put<UserDetailResponse>('/users/me', payload).then((r) => r.data),

  // PUT /empresas/me -> actualiza el perfil de empresa (solo tipo EMPRESA)
  updateEmpresa: (payload: EmpresaUpdateRequest) =>
    api.put('/empresas/me', payload).then((r) => r.data),
};
