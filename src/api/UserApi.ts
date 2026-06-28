import api from './configs/axiosConfig';
import type { Page } from './types/Page';
import type {
  UserResponse,
  UserDetailResponse,
  UserUpdateRequest,
  EmpresaUpdateRequest,
} from './types/User';

export interface UserSearchParams {
  scoreMin?: number;
  scoreMax?: number;
  page?: number;
  size?: number;
}

export const UserApi = {

  me: () => api.get<UserDetailResponse>('/users/me').then((r) => r.data),

  update: (payload: UserUpdateRequest) =>
    api.put<UserDetailResponse>('/users/me', payload).then((r) => r.data),

  updateEmpresa: (payload: EmpresaUpdateRequest) =>
    api.put('/empresas/me', payload).then((r) => r.data),

  search: (params: UserSearchParams, signal?: AbortSignal) =>
    api.get<Page<UserResponse>>('/users/search', { params, signal }).then((r) => r.data),

  getById: (id: number) => api.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  leaderboard: () => api.get<UserResponse[]>('/users/leaderboard').then((r) => r.data),
};
