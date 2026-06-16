// Llamadas relacionadas al usuario logueado.
import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  UserResponse,
  UserDetailResponse,
  UserUpdateRequest,
  EmpresaUpdateRequest,
} from './types/User';

// Filtros para la búsqueda de candidatos (todos opcionales).
export interface UserSearchParams {
  scoreMin?: number;
  scoreMax?: number;
  page?: number;
  size?: number;
}

export const UserApi = {
  // GET /users/me -> datos completos del usuario actual (incluye score y empresa)
  me: () => api.get<UserDetailResponse>('/users/me').then((r) => r.data),

  // PUT /users/me -> actualiza nombre / apellido / githubUsername
  update: (payload: UserUpdateRequest) =>
    api.put<UserDetailResponse>('/users/me', payload).then((r) => r.data),

  // PUT /empresas/me -> actualiza el perfil de empresa (solo tipo EMPRESA)
  updateEmpresa: (payload: EmpresaUpdateRequest) =>
    api.put('/empresas/me', payload).then((r) => r.data),

  // GET /users/search?scoreMin&scoreMax&page&size -> candidatos por rango de score
  // (lo usa la empresa para encontrar talento). Devuelve una página de usuarios.
  search: (params: UserSearchParams) =>
    api.get<Page<UserResponse>>('/users/search', { params }).then((r) => r.data),

  // GET /users/{id} -> perfil público de un usuario (lo usa la empresa para ver candidatos)
  getById: (id: number) => api.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  // GET /users/leaderboard -> top 10 estudiantes por SkillMatch Score
  leaderboard: () => api.get<UserResponse[]>('/users/leaderboard').then((r) => r.data),
};
