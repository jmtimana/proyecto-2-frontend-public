// Habilidades (GET /habilidades es público; POST es solo ADMIN).
import api from './configs/axiosConfig';
import type { HabilidadResponse, HabilidadCreateRequest } from './types/User';

export const HabilidadApi = {
  list: () => api.get<HabilidadResponse[]>('/habilidades').then((r) => r.data),

  // POST /habilidades -> crear una habilidad nueva (solo ADMIN)
  create: (payload: HabilidadCreateRequest) =>
    api.post<HabilidadResponse>('/habilidades', payload).then((r) => r.data),
};
