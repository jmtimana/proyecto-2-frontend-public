// Habilidades (GET /habilidades es público).
import api from './configs/axiosConfig';
import type { HabilidadResponse } from './types/User';

export const HabilidadApi = {
  list: () => api.get<HabilidadResponse[]>('/habilidades').then((r) => r.data),
};
