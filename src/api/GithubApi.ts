// Llamadas al backend para GitHub.
import api from './configs/axiosConfig';
import type {
  GithubConnectRequest,
  GithubProfileResponse,
} from './types/Github';

export const GithubApi = {
  // POST /github/connect -> vincula el token personal del usuario
  connect: (payload: GithubConnectRequest) =>
    api.post<GithubProfileResponse>('/github/connect', payload).then((r) => r.data),

  // GET /github/profile -> trae el perfil ya conectado (falla si no hay conexión)
  profile: () =>
    api.get<GithubProfileResponse>('/github/profile').then((r) => r.data),
};
